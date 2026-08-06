export const getSmsConfig = () => {
  try {
    const saved = localStorage.getItem("sms_gateway_config");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.provider === "twilio") {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse SMS config", e);
  }
  
  const defaultConfig = {
    provider: "textbelt",
    customUrl: "",
    customMethod: "GET",
    customHeaders: "{}",
    customBody: "{\n  \"phone\": \"{phone}\",\n  \"message\": \"{message}\"\n}",
    twilioSid: "",
    twilioToken: "",
    twilioFrom: ""
  };
  localStorage.setItem("sms_gateway_config", JSON.stringify(defaultConfig));
  return defaultConfig;
};

export const saveSmsConfig = (config) => {
  localStorage.setItem("sms_gateway_config", JSON.stringify(config));
};

export const sendSms = async (phone, message) => {
  const config = getSmsConfig();
  
  // Clean phone number: remove spaces and non-digit characters except starting +
  let formattedPhone = phone.trim().replace(/[^\d+]/g, "");
  
  // Default to +91 (India) country code if it is a 10-digit number without country code
  if (formattedPhone.length === 10 && !formattedPhone.startsWith("+")) {
    formattedPhone = `+91${formattedPhone}`;
  } else if (formattedPhone.length > 10 && !formattedPhone.startsWith("+")) {
    // If user typed country code but forgot +, add it
    formattedPhone = `+${formattedPhone}`;
  }

  if (config.provider === "textbelt") {
    try {
      const response = await fetch("https://textbelt.com/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phone: formattedPhone,
          message: message,
          key: "textbelt"
        })
      });
      const data = await response.json();
      if (data.success) {
        return { success: true, messageId: data.textId };
      } else {
        return { 
          success: false, 
          error: data.error || "Failed to send via Textbelt. (Free tier quota limits might be exceeded)." 
        };
      }
    } catch (err) {
      return { success: false, error: `Network error calling Textbelt: ${err.message}` };
    }
  } else if (config.provider === "twilio") {
    const { twilioSid, twilioToken, twilioFrom } = config;
    if (!twilioSid || !twilioToken || !twilioFrom) {
      return { success: false, error: "Twilio credentials are not fully configured." };
    }

    const localUrl = `/twilio-api/2010-04-01/Accounts/${twilioSid}/Messages.json`;
    const basicAuth = btoa(`${twilioSid}:${twilioToken}`);

    const bodyParams = new URLSearchParams();
    bodyParams.append("To", formattedPhone);
    bodyParams.append("From", twilioFrom);
    bodyParams.append("Body", message);

    try {
      const response = await fetch(localUrl, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: bodyParams.toString()
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = text;
      }

      if (response.ok) {
        return { success: true, messageId: data.sid || "success" };
      } else {
        const errorDetail = data.message || (typeof data === "string" ? data : JSON.stringify(data));
        return {
          success: false,
          error: `Twilio Error: ${errorDetail}`
        };
      }
    } catch (err) {
      return { success: false, error: `Twilio proxy network error: ${err.message}` };
    }
  } else if (config.provider === "custom") {
    const { customUrl, customMethod, customHeaders, customBody } = config;
    if (!customUrl) {
      return { success: false, error: "Custom Gateway URL is not configured." };
    }

    // Replace placeholders in the URL
    const finalUrl = customUrl
      .replace(/{phone}/g, encodeURIComponent(formattedPhone))
      .replace(/{message}/g, encodeURIComponent(message));

    let headers = {};
    try {
      if (customHeaders && customHeaders.trim()) {
        headers = JSON.parse(customHeaders);
      }
    } catch (e) {
      return { success: false, error: `Invalid Custom Headers JSON: ${e.message}` };
    }

    let fetchOptions = {
      method: customMethod,
      headers: {
        ...headers
      }
    };

    if (customMethod === "POST") {
      let finalBody = customBody || "";
      finalBody = finalBody
        .replace(/{phone}/g, formattedPhone)
        .replace(/{message}/g, message);
      
      fetchOptions.body = finalBody;

      // Automatically add Content-Type header if body is JSON and not already set
      const hasContentType = Object.keys(headers).some(
        h => h.toLowerCase() === "content-type"
      );
      if (!hasContentType) {
        try {
          JSON.parse(finalBody);
          fetchOptions.headers["Content-Type"] = "application/json";
        } catch (e) {
          fetchOptions.headers["Content-Type"] = "text/plain";
        }
      }
    }

    try {
      const response = await fetch(finalUrl, fetchOptions);
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = text;
      }

      if (response.ok) {
        return { success: true, response: data };
      } else {
        const errorDetail = typeof data === "string" ? data : JSON.stringify(data);
        return { 
          success: false, 
          error: `HTTP Error ${response.status}: ${errorDetail || response.statusText}` 
        };
      }
    } catch (err) {
      return { success: false, error: `Custom Gateway Network error: ${err.message}` };
    }
  }

  return { success: false, error: "Invalid Gateway Provider configured." };
};
