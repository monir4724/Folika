/**
 * FOLIKA (ফলিকা) - Login Page Controller (OTP flow)
 */
document.addEventListener('DOMContentLoaded', () => {
  const api = window.FolikaAPI;
  const cfg = window.FOLIKA_CONFIG || {};
  if (!api) return;

  if (api.Session.isLoggedIn()) {
    window.location.href = '../index.html';
    return;
  }

  const mobileForm = document.getElementById('mobileForm');
  const otpForm = document.getElementById('otpForm');
  const mobileInput = document.getElementById('mobileInput');
  const otpInput = document.getElementById('otpInput');
  const sendBtn = document.getElementById('sendOtpBtn');
  const verifyBtn = document.getElementById('verifyOtpBtn');
  const resendBtn = document.getElementById('resendOtpBtn');
  const changeMobileBtn = document.getElementById('changeMobileBtn');
  const statusBox = document.getElementById('loginStatus');
  const statusText = document.getElementById('loginStatusText');
  const otpTargetText = document.getElementById('otpTargetText');
  const otpTimer = document.getElementById('otpTimer');
  const stepIndicator = document.getElementById('loginStepIndicator');

  const bnDigits = { '0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯' };
  const toBn = (n) => String(n).replace(/\d/g, (d) => bnDigits[d]);
  const toEn = (s) => String(s).replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d));

  let currentMobile = '';
  let timerId = null;
  let timerExpired = false;

  const isLocalDev = /localhost|127\.0\.0\.1/.test(window.location.hostname);

  function showStatus(message, type) {
    statusBox.style.display = 'block';
    statusBox.className = 'alert alert-' + (type === 'danger' ? 'error' : (type || 'info'));
    statusText.textContent = message;
  }
  function hideStatus() { statusBox.style.display = 'none'; }

  function setStep(step) {
    if (stepIndicator) {
      stepIndicator.textContent = step === 1
        ? 'ধাপ ১/২ — মোবাইল নম্বর দিন'
        : 'ধাপ ২/২ — মোবাইলে আসা কোড দিন';
    }
  }

  function updateResendBtn() {
    if (!resendBtn) return;
    resendBtn.disabled = !timerExpired;
    resendBtn.style.display = otpForm.style.display === 'none' ? 'none' : 'block';
  }

  function startTimer(seconds) {
    clearInterval(timerId);
    timerExpired = false;
    updateResendBtn();
    let remaining = seconds;
    const tick = () => {
      if (remaining <= 0) {
        clearInterval(timerId);
        timerExpired = true;
        otpTimer.textContent = 'কোডের মেয়াদ শেষ হয়েছে।';
        updateResendBtn();
        return;
      }
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      otpTimer.textContent = 'সময় বাকি: ' + toBn(m) + ':' + toBn(String(s).padStart(2, '0'));
      remaining--;
    };
    tick();
    timerId = setInterval(tick, 1000);
  }

  async function sendOtpFlow() {
    hideStatus();
    const mobile = toEn(mobileInput.value.trim());
    if (!/^01\d{9}$/.test(mobile)) {
      showStatus('সঠিক ১১ অঙ্কের মোবাইল নম্বর দিন (যেমন: ০১৭১১১১১১১১১)।', 'error');
      mobileInput.focus();
      return;
    }
    if (!navigator.onLine) {
      showStatus('ইন্টারনেট সংযোগ নেই। সংযোগ যাচাই করে আবার চেষ্টা করুন।', 'error');
      return;
    }
    currentMobile = mobile;
    sendBtn.disabled = true;
    if (resendBtn) resendBtn.disabled = true;
    sendBtn.textContent = 'পাঠানো হচ্ছে...';
    try {
      const res = await api.auth.sendOtp(mobile, 'login');
      const expires = (res && res.expires_in_seconds) ? res.expires_in_seconds : 300;
      mobileForm.style.display = 'none';
      otpForm.style.display = 'block';
      setStep(2);
      otpTargetText.textContent = toBn(mobile);
      startTimer(expires);
      let msg = 'আপনার মোবাইলে ৬ অঙ্কের গোপন কোড পাঠানো হয়েছে। এসএমএস দেখে কোড লিখুন।';
      if (isLocalDev && cfg.DEMO_OTP) msg += ' (টেস্ট: ' + toBn(cfg.DEMO_OTP) + ')';
      showStatus(msg, 'success');
      otpInput.focus();
    } catch (err) {
      showStatus(err.banglaMessage || 'কোড পাঠানো যায়নি। একটু পর আবার চেষ্টা করুন।', 'error');
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = 'কোড পাঠান';
      updateResendBtn();
    }
  }

  mobileForm.addEventListener('submit', (e) => { e.preventDefault(); setStep(1); sendOtpFlow(); });
  if (resendBtn) resendBtn.addEventListener('click', () => sendOtpFlow());

  otpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideStatus();
    const otp = toEn(otpInput.value.trim());
    if (!/^\d{6}$/.test(otp)) {
      showStatus('মোবাইলে আসা ৬ অঙ্কের কোড দিন।', 'error');
      otpInput.focus();
      return;
    }
    verifyBtn.disabled = true;
    verifyBtn.textContent = 'যাচাই করা হচ্ছে...';
    try {
      const res = await api.auth.verifyOtp(currentMobile, otp);
      clearInterval(timerId);
      const isNew = res && res.is_new_user;
      showStatus(isNew
        ? 'স্বাগতম! পরের পাতায় আপনার নাম ও ঠিকানা দিন।'
        : 'সফলভাবে প্রবেশ করেছেন!', 'success');
      setTimeout(() => {
        window.location.href = isNew ? 'profile.html' : '../index.html';
      }, isNew ? 1800 : 900);
    } catch (err) {
      showStatus(err.banglaMessage || 'কোড সঠিক নয়। আবার চেষ্টা করুন।', 'error');
      verifyBtn.disabled = false;
      verifyBtn.textContent = 'যাচাই করে প্রবেশ করুন';
    }
  });

  changeMobileBtn.addEventListener('click', () => {
    clearInterval(timerId);
    hideStatus();
    otpForm.style.display = 'none';
    mobileForm.style.display = 'block';
    setStep(1);
    otpInput.value = '';
    if (resendBtn) resendBtn.style.display = 'none';
    mobileInput.focus();
  });

  setStep(1);
  applyLoginLabels();
});

function applyLoginLabels() {
  const L = (bn, en) => {
    const lang = (window.FolikaI18n && window.FolikaI18n.getLang()) || 'bn';
    return lang === 'en' ? en : bn;
  };
  const set = (sel, bn, en) => {
    const el = document.querySelector(sel);
    if (el) el.textContent = L(bn, en);
  };
  set('h1.text-h2', 'কৃষক পরিচয় যাচাই', 'Farmer identity verification');
  set('label[for="mobileInput"]', 'মোবাইল নম্বর', 'Mobile number');
  set('label[for="otpInput"]', 'এসএমএসে আসা ৬ অঙ্কের কোড', '6-digit SMS code');
  set('#sendOtpBtn', 'কোড পাঠান', 'Send code');
  set('#verifyOtpBtn', 'যাচাই করে প্রবেশ করুন', 'Verify and sign in');
  set('#resendOtpBtn', 'আবার কোড পাঠান', 'Resend code');
  set('#changeMobileBtn', 'নম্বর বদলান', 'Change number');
}
