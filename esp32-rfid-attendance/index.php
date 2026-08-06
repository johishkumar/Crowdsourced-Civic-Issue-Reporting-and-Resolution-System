<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RFID RFID Attendance Authentication System</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Google Fonts & Bootstrap Icons -->
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
    
    <style>
        body {
            font-family: 'Outfit', sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-h: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .auth-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 24px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            overflow: hidden;
            width: 100%;
            max-width: 450px;
            transition: all 0.3s ease-in-out;
        }

        .auth-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .card-header-accent {
            background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
            padding: 30px 20px;
            text-align: center;
            color: #ffffff;
        }

        .otp-input-group input {
            width: 48px;
            height: 48px;
            font-size: 22px;
            font-weight: 800;
            text-align: center;
            border-radius: 12px;
            border: 2px solid #e2e8f0;
            background-color: #f8fafc;
            margin: 0 4px;
            transition: all 0.2s ease;
        }

        .otp-input-group input:focus {
            border-color: #6366f1;
            background-color: #ffffff;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
            outline: none;
        }

        .btn-primary-gradient {
            background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 600;
            transition: all 0.2s ease;
        }

        .btn-primary-gradient:hover {
            transform: scale(1.02);
            box-shadow: 0 5px 15px rgba(99, 102, 241, 0.4);
        }

        .btn-primary-gradient:active {
            transform: scale(0.98);
        }

        .success-circle {
            width: 80px;
            height: 80px;
            background-color: #d1fae5;
            color: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            margin: 0 auto 20px;
            animation: bounceIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes bounceIn {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.1); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); opacity: 1; }
        }

        .pulse-scanner {
            font-size: 45px;
            color: #6366f1;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.15); opacity: 0.6; }
            100% { transform: scale(1); opacity: 1; }
        }

        .simulated-log-console {
            background-color: #0f172a;
            color: #38bdf8;
            font-family: 'Courier New', Courier, monospace;
            border-radius: 12px;
            padding: 15px;
            font-size: 13px;
            max-height: 120px;
            overflow-y: auto;
        }
    </style>
</head>
<body>

    <div class="auth-card">
        <!-- Header -->
        <div class="card-header-accent">
            <div class="mb-2"><i class="bi bi-person-check-fill fs-1"></i></div>
            <h4 class="mb-1 fw-bold">RFID Attendance Portal</h4>
            <p class="mb-0 text-white-50 small">Secure SMS OTP Verification System</p>
        </div>

        <div class="card-body p-4">
            
            <!-- STEP 1: MOBILE NUMBER ENTRY -->
            <div id="step-phone">
                <div class="text-center mb-4">
                    <p class="text-muted small">Enter your registered mobile number to request a secure authentication OTP token code.</p>
                </div>

                <form id="form-phone">
                    <div class="mb-3">
                        <label for="input-phone" class="form-label font-semibold small text-uppercase tracking-wider">Mobile Number</label>
                        <div class="input-group">
                            <span class="input-group-text bg-light text-muted font-bold">+91</span>
                            <input 
                                type="tel" 
                                class="form-control form-control-lg font-mono" 
                                id="input-phone" 
                                placeholder="Enter 10-digit number" 
                                required 
                                pattern="[0-9]{10}"
                                maxlength="10"
                            >
                        </div>
                        <div class="form-text text-muted">Example: 9999999999 (Default Rajesh profile number)</div>
                    </div>

                    <div id="alert-phone" class="alert alert-danger d-none" role="alert"></div>

                    <button type="submit" id="btn-phone" class="btn btn-primary btn-primary-gradient w-full d-flex align-items-center justify-content-center gap-2">
                        <span id="spinner-phone" class="spinner-border spinner-border-sm d-none" role="status"></span>
                        <span>Send Authentication OTP</span>
                    </button>
                </form>
            </div>

            <!-- STEP 2: OTP VERIFICATION -->
            <div id="step-otp" class="d-none">
                <div class="text-center mb-4">
                    <h5 class="fw-bold mb-1">Verify OTP Token</h5>
                    <p class="text-muted small">We sent a 6-digit verification code to <span id="display-masked-phone" class="font-bold text-dark"></span></p>
                </div>

                <form id="form-otp">
                    <input type="hidden" id="transaction-id" value="0">
                    <div class="d-flex justify-content-center otp-input-group mb-4">
                        <input type="text" pattern="[0-9]" maxlength="1" id="otp-1" required autocomplete="off" autofocus>
                        <input type="text" pattern="[0-9]" maxlength="1" id="otp-2" required autocomplete="off">
                        <input type="text" pattern="[0-9]" maxlength="1" id="otp-3" required autocomplete="off">
                        <input type="text" pattern="[0-9]" maxlength="1" id="otp-4" required autocomplete="off">
                        <input type="text" pattern="[0-9]" maxlength="1" id="otp-5" required autocomplete="off">
                        <input type="text" pattern="[0-9]" maxlength="1" id="otp-6" required autocomplete="off">
                    </div>

                    <div id="alert-otp" class="alert alert-danger d-none text-center py-2 fs-7 fw-bold" role="alert"></div>

                    <button type="submit" id="btn-otp" class="btn btn-primary btn-primary-gradient w-100 d-flex align-items-center justify-content-center gap-2 mb-3">
                        <span id="spinner-otp" class="spinner-border spinner-border-sm d-none" role="status"></span>
                        <span>Verify & Mark Attendance</span>
                    </button>
                </form>

                <div class="text-center mt-3 fs-7">
                    <span class="text-muted">Didn't receive verification code?</span>
                    <div class="mt-1.5">
                        <span id="timer-text" class="text-muted font-bold">Resend code in <span id="timer-seconds">60</span>s</span>
                        <button type="button" id="btn-resend" class="btn btn-link p-0 text-decoration-none fw-bold text-indigo d-none">Resend Code</button>
                    </div>
                </div>
            </div>

            <!-- STEP 3: ATTENDANCE LOGGED SUCCESS -->
            <div id="step-success" class="d-none text-center py-3">
                <div class="success-circle">
                    <i class="bi bi-check-circle-fill"></i>
                </div>
                <h4 class="fw-bold text-success mb-1">Attendance Marked!</h4>
                <p class="text-muted small">Success. Your swipe status has been registered.</p>
                
                <div class="bg-light rounded-3 p-3 my-4 text-start small">
                    <div class="row mb-1">
                        <div class="col-5 text-muted font-semibold">User:</div>
                        <div class="col-7 font-bold text-dark" id="res-user"></div>
                    </div>
                    <div class="row mb-1">
                        <div class="col-5 text-muted font-semibold">UID Ref:</div>
                        <div class="col-7 font-mono" id="res-uid">Verified Tag</div>
                    </div>
                    <div class="row mb-1">
                        <div class="col-5 text-muted font-semibold">Date:</div>
                        <div class="col-7" id="res-date"></div>
                    </div>
                    <div class="row">
                        <div class="col-5 text-muted font-semibold">Logged Time:</div>
                        <div class="col-7" id="res-time"></div>
                    </div>
                </div>

                <button type="button" id="btn-restart" class="btn btn-outline-secondary btn-sm w-100 py-2.5 rounded-3">
                    Log Another Check-in
                </button>
            </div>

            <!-- SIMULATED GATEWAY DEBUGGING CONSOLE -->
            <div id="simulated-gateway-box" class="mt-4 border-top pt-3 d-none animate-fade-in">
                <label class="form-label text-uppercase text-muted font-black tracking-wider text-[9px] d-flex align-items-center gap-1.5">
                    <i class="bi bi-cpu pulse-scanner"></i>
                    <span>Simulated SMS Network logs</span>
                </label>
                <div class="simulated-log-console" id="log-console">
                    [System] Awaiting phone swipe or manual request...
                </div>
            </div>

        </div>
    </div>

    <!-- Bootstrap 5 JavaScript Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const stepPhone = document.getElementById('step-phone');
            const stepOtp = document.getElementById('step-otp');
            const stepSuccess = document.getElementById('step-success');

            const formPhone = document.getElementById('form-phone');
            const inputPhone = document.getElementById('input-phone');
            const btnPhone = document.getElementById('btn-phone');
            const spinnerPhone = document.getElementById('spinner-phone');
            const alertPhone = document.getElementById('alert-phone');

            const formOtp = document.getElementById('form-otp');
            const transactionIdInput = document.getElementById('transaction-id');
            const btnOtp = document.getElementById('btn-otp');
            const spinnerOtp = document.getElementById('spinner-otp');
            const alertOtp = document.getElementById('alert-otp');
            const displayMaskedPhone = document.getElementById('display-masked-phone');

            const timerText = document.getElementById('timer-text');
            const timerSeconds = document.getElementById('timer-seconds');
            const btnResend = document.getElementById('btn-resend');

            const resUser = document.getElementById('res-user');
            const resUid = document.getElementById('res-uid');
            const resDate = document.getElementById('res-date');
            const resTime = document.getElementById('res-time');
            const btnRestart = document.getElementById('btn-restart');

            const simulatedGatewayBox = document.getElementById('simulated-gateway-box');
            const logConsole = document.getElementById('log-console');

            let countdownTimer = null;
            let currentPhone = "";

            // OTP Segments Autoshift & Shift-Back logic
            const otpInputs = [
                document.getElementById('otp-1'),
                document.getElementById('otp-2'),
                document.getElementById('otp-3'),
                document.getElementById('otp-4'),
                document.getElementById('otp-5'),
                document.getElementById('otp-6')
            ];

            otpInputs.forEach((input, index) => {
                input.addEventListener('input', (e) => {
                    // Filter non-digits
                    input.value = input.value.replace(/\D/g, '');
                    if (input.value.length === 1 && index < 5) {
                        otpInputs[index + 1].focus();
                    }
                });

                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Backspace' && !input.value && index > 0) {
                        otpInputs[index - 1].focus();
                        otpInputs[index - 1].value = '';
                    }
                });

                // Clipboard Paste event check
                if (index === 0) {
                    input.addEventListener('paste', (e) => {
                        e.preventDefault();
                        const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                        if (pasteData.length === 6) {
                            pasteData.split('').forEach((char, idx) => {
                                otpInputs[idx].value = char;
                            });
                            otpInputs[5].focus();
                        }
                    });
                }
            });

            // Logger Helper
            function addLog(text) {
                const now = new Date();
                const timestamp = now.toTimeString().split(' ')[0];
                logConsole.innerHTML += `\n[${timestamp}] ${text}`;
                logConsole.scrollTop = logConsole.scrollHeight;
            }

            // Resend Countdown Timer logic
            function startCountdown() {
                clearInterval(countdownTimer);
                let duration = 60;
                timerText.classList.remove('d-none');
                btnResend.classList.add('d-none');
                timerSeconds.textContent = duration;

                countdownTimer = setInterval(() => {
                    duration--;
                    timerSeconds.textContent = duration;
                    if (duration <= 0) {
                        clearInterval(countdownTimer);
                        timerText.classList.add('d-none');
                        btnResend.classList.remove('d-none');
                    }
                }, 1000);
            }

            // Submit Mobile Phone logic (Step 1)
            formPhone.addEventListener('submit', async (e) => {
                e.preventDefault();
                alertPhone.classList.add('d-none');
                spinnerPhone.classList.remove('d-none');
                btnPhone.disabled = true;

                currentPhone = inputPhone.value;

                try {
                    const response = await fetch('api/send_otp.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ phone: currentPhone })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok && data.status === 'success') {
                        // OTP generated and sent
                        transactionIdInput.value = data.transaction_id;
                        displayMaskedPhone.textContent = data.phone;
                        
                        // Check if simulated OTP is provided
                        if (data.simulated_otp) {
                            simulatedGatewayBox.classList.remove('d-none');
                            addLog(`SIMULATED OTP for ${data.name}: ${data.simulated_otp}`);
                        }

                        // Shift steps
                        stepPhone.classList.add('d-none');
                        stepOtp.classList.remove('d-none');
                        otpInputs[0].focus();
                        
                        startCountdown();
                    } else {
                        alertPhone.textContent = data.message || "Failed to trigger OTP verification.";
                        alertPhone.classList.remove('d-none');
                    }
                } catch (err) {
                    alertPhone.textContent = "Server communication failure: " + err.message;
                    alertPhone.classList.remove('d-none');
                } finally {
                    spinnerPhone.classList.add('d-none');
                    btnPhone.disabled = false;
                }
            });

            // Resend OTP trigger (Step 2 Resend link)
            btnResend.addEventListener('click', async () => {
                alertOtp.classList.add('d-none');
                otpInputs.forEach(i => i.value = '');

                try {
                    const response = await fetch('api/send_otp.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ phone: currentPhone })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok && data.status === 'success') {
                        transactionIdInput.value = data.transaction_id;
                        if (data.simulated_otp) {
                            addLog(`SIMULATED OTP (Resent): ${data.simulated_otp}`);
                        }
                        alertOtp.className = "alert alert-success d-block text-center py-2 fs-7 fw-bold";
                        alertOtp.textContent = "A new verification code was sent.";
                        setTimeout(() => alertOtp.className = "alert alert-danger d-none text-center py-2 fs-7 fw-bold", 3000);
                        
                        startCountdown();
                        otpInputs[0].focus();
                    } else {
                        alertOtp.className = "alert alert-danger d-block text-center py-2 fs-7 fw-bold";
                        alertOtp.textContent = data.message || "Failed to resend code.";
                    }
                } catch (err) {
                    alertOtp.className = "alert alert-danger d-block text-center py-2 fs-7 fw-bold";
                    alertOtp.textContent = "Failed to resend code: " + err.message;
                }
            });

            // Submit OTP code verification (Step 2 Submit)
            formOtp.addEventListener('submit', async (e) => {
                e.preventDefault();
                alertOtp.className = "alert alert-danger d-none text-center py-2 fs-7 fw-bold";
                spinnerOtp.classList.remove('d-none');
                btnOtp.disabled = true;

                // Collect entered code segments
                const code = otpInputs.map(input => input.value).join('');
                
                try {
                    const response = await fetch('api/verify_otp.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            transaction_id: parseInt(transactionIdInput.value),
                            otp: code
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok && data.status === 'success') {
                        // Verification successful! Display results page
                        resUser.textContent = data.user;
                        resUid.textContent = data.user === 'Rajesh Kumar' ? 'DE-AD-BE-EF' : 'Verified Tag RFID';
                        resDate.textContent = data.date;
                        resTime.textContent = data.time;

                        stepOtp.classList.add('d-none');
                        stepSuccess.classList.remove('d-none');
                    } else {
                        alertOtp.className = "alert alert-danger d-block text-center py-2 fs-7 fw-bold";
                        alertOtp.textContent = data.message || "OTP verification failed.";
                        // Clear inputs
                        otpInputs.forEach(i => i.value = '');
                        otpInputs[0].focus();
                    }
                } catch (err) {
                    alertOtp.className = "alert alert-danger d-block text-center py-2 fs-7 fw-bold";
                    alertOtp.textContent = "Connection failure: " + err.message;
                } finally {
                    spinnerOtp.classList.add('d-none');
                    btnOtp.disabled = false;
                }
            });

            // Restart flow
            btnRestart.addEventListener('click', () => {
                clearInterval(countdownTimer);
                inputPhone.value = '';
                otpInputs.forEach(i => i.value = '');
                transactionIdInput.value = '0';
                currentPhone = "";
                
                stepSuccess.classList.add('d-none');
                stepPhone.classList.remove('d-none');
            });
        });
    </script>
</body>
</html>
