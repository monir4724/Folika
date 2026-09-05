#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Rebuild all pages/*.html with correct UTF-8 Bengali text."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = ROOT / "pages"

CSS_LINKS = """  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/tokens.css">
  <link rel="stylesheet" href="../css/base.css">
  <link rel="stylesheet" href="../css/components.css">
  <link rel="stylesheet" href="../css/layout.css?v=20260829">"""

FOOTER = """  <footer class="site-footer" role="contentinfo">
    <div class="container">
      <div class="footer-bottom">
        <p>© ২০২৬ ফলিকা • <span data-i18n="footer_rights">সর্বস্বত্ব সংরক্ষিত</span></p>
      </div>
    </div>
  </footer>"""

BOTTOM_NAV = """  <nav class="bottom-nav" aria-label="মোবাইল দ্রুত নেভিগেশন"></nav>"""


def scripts_block(*page_scripts: str, tail: tuple[str, ...] = ()) -> str:
    order = ["config.js", "api.js", "i18n.js", *page_scripts, "page-copy.js", "nav.js", "main.js?v=20260829", *tail]
    return "\n".join(f'  <script src="../js/{src}"></script>' for src in order)


def profile_scripts_block() -> str:
    order = [
        "config.js", "api.js", "api-client.js", "offline-sync.js",
        "profile-utils.js", "i18n.js", "page-copy.js", "nav.js",
        "main.js?v=20260829", "profile-pages.js",
    ]
    return "\n".join(f'  <script src="../js/{src}"></script>' for src in order)


def header_block(action: str = "profile") -> str:
    if action == "home":
        actions = '        <a href="../index.html" class="btn btn-sm btn-secondary">হোম</a>'
    elif action == "profile":
        actions = """        <a href="profile.html" class="header-user-widget" aria-label="ইউজার প্রোফাইল">
          <div class="header-user-info">
            <span class="header-user-name">মোঃ মনিরুজামান</span>
            <span class="header-user-loc">শেরপুর, বগুড়া</span>
          </div>
          <div class="header-user-avatar" aria-hidden="true">ম</div>
        </a>"""
    else:
        actions = ""
    return f"""  <header class="site-header" role="banner">
    <div class="nav-container">
      <button id="mobileMenuToggle" class="menu-toggle-btn" aria-label="মেনু খুলুন" aria-expanded="false" aria-controls="mobileDrawerBackdrop">
        <span class="menu-bar" aria-hidden="true"></span>
        <span class="menu-bar" aria-hidden="true"></span>
        <span class="menu-bar" aria-hidden="true"></span>
      </button>
      <a href="../index.html" class="brand-link" aria-label="ফলিকা হোম পেজ">
        <img src="../assets/images/logo.png" alt="" class="brand-logo">
        <div class="brand-text-wrap">
          <span class="brand-title" data-i18n="brand_title">ফলিকা</span>
          <span class="brand-tagline" data-i18n="brand_tagline">কৃষকের ডিজিটাল সঙ্গী</span>
        </div>
      </a>
      <div class="header-actions">
{actions}
      </div>
    </div>
  </header>"""


def sub_nav_block() -> str:
    return """  <nav class="sub-nav-bar" aria-label="প্রধান মেনু">
    <div class="container">
      <div class="nav-pills-wrap"></div>
    </div>
  </nav>"""


def drawer_block() -> str:
    return """  <div id="mobileDrawerBackdrop" class="mobile-drawer-backdrop" aria-hidden="true">
    <div class="mobile-drawer" role="dialog" aria-modal="true" aria-label="মোবাইল নেভিগেশন">
      <div class="mobile-drawer-header">
        <div class="flex items-center gap-8">
          <img src="../assets/images/logo.png" alt="ফলিকা লোগো" style="height: 48px;">
          <span class="font-bold text-white" data-i18n="menu_title">ফলিকা মেনু</span>
        </div>
        <button id="mobileDrawerClose" class="btn-icon-only text-white" aria-label="মেনু বন্ধ করুন">বন্ধ</button>
      </div>
      <div class="mobile-drawer-links"></div>
    </div>
  </div>"""


def page_shell(
    title: str,
    description: str,
    main_id: str,
    body: str,
    page_scripts: tuple[str, ...] = (),
    tail_scripts: tuple[str, ...] = (),
    extra_css: tuple[str, ...] = (),
    extra_head: str = "",
    header_action: str = "profile",
    with_sub_nav: bool = True,
    with_drawer: bool = True,
    with_bottom_nav: bool = True,
    with_footer: bool = True,
    body_attrs: str = "",
) -> str:
    css_extra = "\n".join(f'  <link rel="stylesheet" href="../css/{c}">' for c in extra_css)
    parts = [
        "<!DOCTYPE html>",
        '<html lang="bn">',
        "<head>",
        '  <meta charset="UTF-8">',
        '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
        f"  <title>{title}</title>",
        f'  <meta name="description" content="{description}">',
        extra_head,
        CSS_LINKS,
        css_extra,
        "</head>",
        f"<body{body_attrs}>",
        "",
        f'  <a href="#{main_id}" class="skip-link" data-i18n="skip_content">মূল বিষয়বস্তুতে যান</a>',
        "",
        header_block(header_action),
    ]
    if with_sub_nav:
        parts.extend(["", sub_nav_block()])
    if with_drawer:
        parts.extend(["", drawer_block()])
    parts.extend([
        "",
        f'  <main id="{main_id}" class="main-content" role="main">',
        body,
        "  </main>",
    ])
    if with_bottom_nav:
        parts.extend(["", BOTTOM_NAV])
    if with_footer:
        parts.extend(["", FOOTER])
    parts.extend(["", scripts_block(*page_scripts, tail=tail_scripts), "</body>", "</html>", ""])
    return "\n".join(p for p in parts if p is not None)


def profile_minimal(
    data_page: str,
    title: str,
    heading: str,
    back_href: str,
    back_label: str,
    with_pager: bool = False,
) -> str:
    pager = '\n    <div id="pagePager" class="flex justify-center gap-8" style="margin-top:16px;"></div>' if with_pager else ""
    return f"""<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
{CSS_LINKS}
  <link rel="stylesheet" href="../css/profile.css">
</head>
<body data-profile-page="{data_page}">
  <main id="main" class="main-content">
    <div class="container">
      <div class="profile-detail-back"><a href="{back_href}" class="btn btn-secondary">{back_label}</a></div>
      <h1 class="text-h2">{heading}</h1>
      <div id="pageContent"><div class="profile-skeleton" style="height:120px;"></div></div>{pager}
    </div>
  </main>
{profile_scripts_block()}
</body>
</html>
"""


def build_crop() -> str:
    body = """    <div class="container">
      <div id="cropPlanRoot"></div>
    </div>"""
    return page_shell(
        "ফসল পরিকল্পনা — ফলিকা",
        "ফলিকা ফসল পরিকল্পনা — জমি পরিমাপ, ফসল সুপারিশ, সেচ ও সার হিসাব",
        "cropMain",
        body,
        page_scripts=("geo-bd.js", "location.js", "crop-data.js", "crop-reco.js", "plan-sync.js", "crop-plan.js"),
    )


def build_livestock() -> str:
    body = """    <div class="container">
      <div id="livestockPlanRoot"></div>
    </div>"""
    html = page_shell(
        "প্রাণিসম্পদ পরিকল্পনা — ফলিকা",
        "ফলিকা প্রাণিসম্পদ পরিকল্পনা — গবাদি পশু, খাদ্য তালিকা, টিকা ও স্বাস্থ্য পর্যবেক্ষণ",
        "livestockMain",
        body,
        page_scripts=("geo-bd.js", "location.js", "livestock-data.js", "plan-sync.js", "livestock-plan.js"),
    )
    modal = """
  <div id="livestockReminderModal" class="modal-backdrop" aria-hidden="true" role="dialog" aria-modal="true">
    <div class="modal-container">
      <div class="modal-header">
        <h3 class="modal-title">প্রাণিসম্পদ পরিকল্পনা রিমাইন্ডার</h3>
        <button class="modal-close-btn" data-modal-close aria-label="বন্ধ করুন">বন্ধ</button>
      </div>
      <div class="modal-body">
        <form data-validate>
          <div class="form-group">
            <label class="form-label" for="lsRemindTask">কাজের ধরন</label>
            <select id="lsRemindTask" class="form-control">
              <option value="anthrax">এনথ্রাক্স (গুবড়ু) টিকাদান সময়</option>
              <option value="deworm">কৃমিনাশক প্রয়োগের তারিখ</option>
              <option value="calcium">ক্যালসিয়াম ও ভিটামিন খাওয়ানো</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="lsRemindDate">তারিখ</label>
            <input type="date" id="lsRemindDate" class="form-control" required>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-modal-close>বাতিল</button>
            <button type="submit" class="btn btn-primary">সংরক্ষণ করুন</button>
          </div>
        </form>
      </div>
    </div>
  </div>
"""
    return html.replace("  </main>", modal + "\n  </main>", 1)


def build_login() -> str:
    theme_snippet = """  <script>
    try {
      var t = localStorage.getItem('folika-theme');
      if (t) document.documentElement.setAttribute('data-theme', t);
    } catch (e) {}
  </script>"""
    body = """    <div class="container" style="max-width: 480px;">
      <section class="card" style="margin-top: 24px; border-top: 4px solid var(--color-primary);">
        <div class="section-header" style="text-align: center; display: block;">
          <h1 class="text-h2" style="color: var(--color-primary); margin-bottom: 4px;">কৃষক পরিচয় যাচাই</h1>
          <p id="loginStepIndicator" class="text-body-sm text-secondary">ধাপ ১/২ — মোবাইল নম্বর দিন</p>
        </div>
        <div id="loginStatus" class="alert" role="status" aria-live="polite" style="display:none; margin-bottom: 16px;">
          <div class="alert-content"><span id="loginStatusText"></span></div>
        </div>
        <form id="mobileForm" novalidate>
          <div class="form-group">
            <label for="mobileInput" class="form-label">মোবাইল নম্বর</label>
            <input type="tel" id="mobileInput" class="form-control" placeholder="01XXXXXXXXX"
              inputmode="numeric" autocomplete="tel" maxlength="11" aria-describedby="mobileHelp" required
              style="min-height: 48px; font-size: 18px; letter-spacing: 1px;">
            <small id="mobileHelp" class="text-caption">১১ সংখ্যার বাংলাদেশি মোবাইল নম্বর দিন। ডেমো: ০১৭১১১১১১১১১</small>
          </div>
          <button type="submit" id="sendOtpBtn" class="btn btn-primary" style="width: 100%; min-height: 48px;">কোড পাঠান</button>
        </form>
        <form id="otpForm" novalidate style="display:none;">
          <div class="form-group">
            <label for="otpInput" class="form-label">এসএমএসে আসা ৬ অঙ্কের কোড</label>
            <input type="text" id="otpInput" class="form-control" placeholder="৬ অঙ্কের কোড"
              inputmode="numeric" autocomplete="one-time-code" maxlength="6" required
              style="min-height: 48px; font-size: 22px; letter-spacing: 6px; text-align: center;">
            <small class="text-caption">
              <span id="otpTargetText"></span> নম্বরে পাঠানো কোড লিখুন
              <span id="otpTimer" class="font-semibold"></span>
            </small>
          </div>
          <button type="submit" id="verifyOtpBtn" class="btn btn-primary" style="width: 100%; min-height: 48px;">যাচাই করে প্রবেশ করুন</button>
          <button type="button" id="resendOtpBtn" class="btn btn-primary" style="width: 100%; min-height: 48px; margin-top: 10px; display:none;" disabled>আবার কোড পাঠান</button>
          <button type="button" id="changeMobileBtn" class="btn btn-secondary" style="width: 100%; min-height: 44px; margin-top: 10px;">নম্বর বদলান</button>
        </form>
      </section>
      <p class="text-center" style="margin-top: 16px;">
        <a href="../index.html" class="btn btn-sm btn-secondary">হোমে ফিরে যান</a>
      </p>
    </div>"""
    return page_shell(
        "লগইন — ফলিকা",
        "ফলিকা লগইন — মোবাইল নম্বর ও ওটিপি দিয়ে নিরাপদ প্রবেশ",
        "loginMain",
        body,
        page_scripts=(),
        tail_scripts=("login.js",),
        extra_head=theme_snippet,
        header_action="home",
        with_drawer=False,
        with_bottom_nav=False,
        with_footer=False,
    )


def build_disease() -> str:
    body = """    <div class="container">
      <section class="section">
        <div class="flex items-center justify-between flex-wrap gap-12">
          <div>
            <span class="badge badge-disease" style="margin-bottom: 8px;">এআই রোগ নির্ণয়</span>
            <h1 class="text-h1">ছবি তুলে ফসলের রোগ শনাক্ত করুন</h1>
            <p class="text-body-lg text-secondary">মোবাইল ক্যামেরা বা গ্যালারি থেকে পাতার ছবি আপলোড করুন</p>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="card card-domain-disease">
          <div class="dropzone" id="diseaseDropzone" tabindex="0" role="button" aria-label="ছবি আপলোড করতে এখানে ট্যাপ করুন বা ফাইল বাছাই করুন">
            <input type="file" id="diseaseFileInput" accept="image/*" style="display: none;">
            <svg class="dropzone-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <div>
              <h2 class="text-h3" style="color: var(--color-disease); margin-bottom: 4px;">এখানে ছবি টেনে আনুন বা ক্যামেরা খুলুন</h2>
              <p class="text-body-sm text-tertiary">স্পষ্ট, আলোযুক্ত ছবি দিন — JPG/PNG (সর্বোচ্চ ১০ MB)</p>
            </div>
            <button type="button" class="btn btn-domain-disease btn-sm">গ্যালারি / ক্যামেরা খুলুন</button>
          </div>
          <div id="dropzonePreview" style="display: none;"></div>
          <div class="flex justify-center" style="margin-top: 20px;">
            <button id="analyzeButton" class="btn btn-primary btn-lg" style="min-width: 260px;" disabled>এআই দিয়ে রোগ বিশ্লেষণ করুন</button>
          </div>
          <div id="diagnosisLoading" style="display: none; text-align: center; padding: 24px;">
            <div class="spinner"></div>
            <p class="text-body font-semibold text-primary" style="margin-top: 12px;">ছবি যাচাই হচ্ছে ও রোগ শনাক্ত করা হচ্ছে...</p>
          </div>
        </div>
      </section>
      <div id="diseaseDemoBanner" class="alert alert-warning" style="display:none;margin-bottom:16px;" role="status">
        <div class="alert-content">
          <strong>ডেমো ফলাফল:</strong> লগইন ছাড়াই নমুনা রোগের তথ্য দেখানো হয়েছে।
        </div>
      </div>
      <section id="diagnosisResult" class="section" style="display: none;" aria-label="রোগ শনাক্তকরণ ফলাফল">
        <div class="section-header">
          <h2 class="section-title text-disease">রোগ শনাক্তকরণ ফলাফল</h2>
          <span class="badge badge-severe">তীব্রতা: মাঝারি</span>
        </div>
        <div class="grid grid-cols-1 grid-cols-md-2 gap-16">
          <div class="card card-domain-disease">
            <div class="flex items-center justify-between" style="margin-bottom: 12px;">
              <h3 class="card-title diagnosis-name">ধান পাতার ব্লাস্ট (Leaf Blast)</h3>
              <span class="badge badge-expert diagnosis-confidence">নির্ভুলতা: ৮৭.৫%</span>
            </div>
            <p class="text-body text-secondary" style="margin-bottom: 12px;">
              <strong>বর্ণনা:</strong> ধান গাছের পাতায় হীরার আকৃতির দাগ দেখা যায়। আর্দ্র আবহাওয়ায় দ্রুত ছড়ায় এবং ফলন কমিয়ে দেয়।
            </p>
            <div class="alert alert-warning" style="margin-bottom: 0;">
              <div class="alert-content">
                <strong>সতর্কতা:</strong> সংক্রমিত পাতা সংগ্রহ করে পুড়িয়ে ফেলুন।
              </div>
            </div>
          </div>
          <div class="card" style="background-color: var(--color-success-tint); border: 2px solid var(--color-success);">
            <h3 class="card-title text-success" style="margin-bottom: 8px;">চিকিৎসা পরামর্শ ও পদক্ষেপ</h3>
            <ul style="padding-left: 20px; color: var(--color-text-primary); line-height: 1.8;">
              <li>প্রথমে <strong>২ গ্রাম ট্রাইসাইক্লাজল (যেমন: ব্লাস্টিসিন / সেফ)</strong> প্রতি লিটার পানিতে স্প্রে করুন</li>
              <li>প্রয়োজনে <strong>কার্বেন্ডাজিম (যেমন: বাভিস্টিন) ও তামা/জিংক</strong> মিশ্রিত স্প্রে দিন</li>
              <li>সপ্তাহে ১০–১৪ দিন পর পর ২–৩ বার স্প্রে করুন</li>
            </ul>
          </div>
        </div>
        <div class="card" style="margin-top: 16px; background-color: var(--color-govt-tint); border: 2px solid var(--color-govt);">
          <div class="flex items-center justify-between flex-wrap gap-12">
            <div>
              <h3 class="card-title text-info">কাছের কৃষি অফিস থেকে পরামর্শ নিন</h3>
              <p class="text-body-sm text-secondary">স্থানীয় উপসহকারী কৃষি কর্মকর্তা — ফোন: ১৬১২৩</p>
            </div>
            <div class="flex gap-8">
              <a href="tel:16123" class="btn btn-sm btn-domain-govt">কল করুন — ১৬১২৩</a>
              <a href="community.html" class="btn btn-sm btn-secondary">কমিউনিটিতে ডিলার খুঁজুন</a>
            </div>
          </div>
        </div>
      </section>
    </div>"""
    return page_shell(
        "রোগ নির্ণয় — ফলিকা",
        "ফলিকা রোগ নির্ণয় — ছবি তুলে এআই দিয়ে ফসলের রোগ শনাক্ত ও চিকিৎসা পরামর্শ",
        "diseaseMain",
        body,
        page_scripts=("geo-bd.js", "location.js"),
    )


def build_govt() -> str:
    body = """    <div class="container">
      <section class="page-hero page-hero-govt">
        <div class="flex items-center justify-between flex-wrap gap-12">
          <div>
            <span class="badge badge-govt" style="margin-bottom: 8px;">সরকারি সহায়তা</span>
            <h1 class="text-h1">কৃষি ভর্তুকি ও জরুরি সেবা তথ্য</h1>
            <p class="text-body-lg text-secondary">হটলাইন, ভর্তুকি স্কিম ও স্থানীয় কৃষি অফিসের তথ্য</p>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="section-header">
          <h2 class="section-title text-govt">জরুরি হটলাইন নম্বর</h2>
        </div>
        <div class="grid grid-cols-1 grid-cols-sm-2 grid-cols-lg-3 gap-16">
          <div class="card card-domain-govt">
            <h3 class="card-title">কৃষি তথ্য সেবা (১৬১২৩)</h3>
            <p class="text-body-sm text-secondary" style="margin: 6px 0 12px;">বিনামূল্যে কৃষি পরামর্শ ও তথ্য সেবা</p>
            <a href="tel:16123" class="btn btn-domain-govt btn-block" style="font-size:28px;text-decoration:none;">১৬১২৩ — কল করুন</a>
          </div>
          <div class="card card-domain-govt">
            <h3 class="card-title">প্রাণিসম্পদ সেবা (১০৬৫৫)</h3>
            <p class="text-body-sm text-secondary" style="margin: 6px 0 12px;">পশু-পাখি রোগ ও চিকিৎসা পরামর্শ</p>
            <a href="tel:10655" class="btn btn-domain-govt btn-block" style="font-size:28px;text-decoration:none;">১০৬৫৫ — কল করুন</a>
          </div>
          <div class="card card-domain-govt">
            <h3 class="card-title">জাতীয় জরুরি সেবা (৯৯৯)</h3>
            <p class="text-body-sm text-secondary" style="margin: 6px 0 12px;">পুলিশ, ফায়ার সার্ভিস ও জরুরি সহায়তা</p>
            <a href="tel:999" class="btn btn-domain-govt btn-block" style="font-size:28px;text-decoration:none;">৯৯৯ — কল করুন</a>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">কৃষি ভর্তুকি ও প্রণোদনা (ডেমো)</h2>
        </div>
        <div class="grid grid-cols-1 grid-cols-md-2 gap-16">
          <div class="card card-domain-govt">
            <span class="badge badge-verified" style="margin-bottom: 8px;">সক্রিয় স্কিম</span>
            <h3 class="card-title">সেচ যন্ত্রপাতিতে ৫০%-৭০% ভর্তুকি</h3>
            <p class="text-body text-secondary" style="margin: 8px 0 16px;">
              ড্রিপ/স্প্রিংকলার সেচ, সোলার পাম্প ও নলকূপে সরকারি ৫০% থেকে ৭০% পর্যন্ত ভর্তুকি পাওয়া যায়।
            </p>
            <button class="btn btn-sm btn-domain-govt" onclick="alert('আপনার উপজেলা কৃষি অফিসে আবেদন ফরম সংগ্রহ করুন')">আবেদন প্রক্রিয়া দেখুন</button>
          </div>
          <div class="card card-domain-govt">
            <span class="badge badge-verified" style="margin-bottom: 8px;">বিশেষ প্রকল্প</span>
            <h3 class="card-title">মাছ ও হাঁস-মুরগি পালনে সহায়তা</h3>
            <p class="text-body text-secondary" style="margin: 8px 0 16px;">
              ১ বিঘা পুকুরে মাছ চাষ ও ৫০০ হাঁস/মুরগি পালনে প্রশিক্ষণ ও পুনরুৎপাদন/খাদ্য সহায়তা পাওয়া যায়।
            </p>
            <button class="btn btn-sm btn-domain-govt" onclick="alert('স্থানীয় উপজেলা প্রাণিসম্পদ অফিসে যোগাযোগ করুন')">আবেদন প্রক্রিয়া দেখুন</button>
          </div>
        </div>
      </section>
    </div>"""
    return page_shell(
        "সরকারি সেবা — ফলিকা",
        "ফলিকা সরকারি সেবা — কৃষি ভর্তুকি, জরুরি হটলাইন ও স্থানীয় অফিস",
        "govtMain",
        body,
        page_scripts=("geo-bd.js", "location.js"),
    )


def build_settings() -> str:
    body = """    <div class="container" style="max-width: 840px;">
      <div class="section-header" style="margin-bottom: 24px;">
        <div>
          <h1 class="text-h1" data-i18n="settings_title">সেটিংস</h1>
          <p class="text-body text-secondary">ভাষা, থিম, নোটিফিকেশন, অফলাইন সিঙ্ক ও অ্যাক্সেসিবিলিটি</p>
        </div>
      </div>
      <section class="card" style="margin-bottom: 20px;" aria-label="ভাষা ও থিম">
        <h2 class="card-title text-primary" style="margin-bottom: 16px;">ভাষা ও থিম</h2>
        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label" for="appLanguageSelect" data-i18n="settings_lang">ভাষা</label>
          <select id="appLanguageSelect" class="form-control">
            <option value="bn" selected>বাংলা</option>
            <option value="en">ইংরেজি</option>
          </select>
        </div>
        <div class="flex items-center justify-between" style="padding: 12px 0; border-top: 1px solid var(--color-border);">
          <div>
            <div class="font-bold text-body">ডার্ক / লাইট থিম</div>
            <div class="text-caption">রাতে চোখের জন্য গাঢ় থিম বা দিনে হালকা থিম বেছে নিন</div>
          </div>
          <label class="toggle-switch" aria-label="থিম পরিবর্তন">
            <input type="checkbox" id="themeToggle">
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </label>
        </div>
        <div class="flex items-center justify-between" style="padding: 12px 0; border-top: 1px solid var(--color-border);">
          <div>
            <div class="font-bold text-body">উচ্চ কনট্রাস্ট মোড</div>
            <div class="text-caption">রঙের পার্থক্য বাড়িয়ে পাঠযোগ্যতা উন্নত করুন</div>
          </div>
          <label class="toggle-switch" aria-label="উচ্চ কনট্রাস্ট মোড">
            <input type="checkbox" id="contrastToggle">
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </label>
        </div>
        <div class="flex items-center justify-between" style="padding: 12px 0; border-top: 1px solid var(--color-border);">
          <div>
            <div class="font-bold text-body">ফন্টের আকার</div>
            <div class="text-caption">বড় ফন্টে পড়তে সুবিধা হলে বড় সাইজ বেছে নিন</div>
          </div>
          <select id="fontScaleSelect" class="form-control" style="max-width: 140px; min-height: 44px;" aria-label="ফন্টের আকার">
            <option value="default">সাধারণ</option>
            <option value="large">বড়</option>
          </select>
        </div>
      </section>
      <section class="card" style="margin-bottom: 20px;" aria-label="নোটিফিকেশন">
        <h2 class="card-title text-primary" style="margin-bottom: 16px;">নোটিফিকেশন</h2>
        <div class="flex items-center justify-between" style="padding-bottom: 12px;">
          <div>
            <div class="font-bold text-body">আবহাওয়া ও সেচ-সার পরামর্শ</div>
            <div class="text-caption">বৃষ্টি বা খরা সতর্কতা পেতে চালু রাখুন</div>
          </div>
          <label class="toggle-switch" aria-label="আবহাওয়া নোটিফিকেশন">
            <input type="checkbox" id="settingsWeatherNotify" checked>
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </label>
        </div>
        <div class="flex items-center justify-between" style="padding: 12px 0; border-top: 1px solid var(--color-border);">
          <div>
            <div class="font-bold text-body">ফসল ও পশু পরিকল্পনা রিমাইন্ডার</div>
            <div class="text-caption">সার, সেচ, টিকা ইত্যাদির তারিখ মনে করিয়ে দেয়</div>
          </div>
          <label class="toggle-switch" aria-label="রিমাইন্ডার নোটিফিকেশন">
            <input type="checkbox" id="settingsReminderNotify" checked>
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </label>
        </div>
      </section>
      <section class="card" style="margin-bottom: 20px;" aria-label="অফলাইন ও ক্যাশ">
        <h2 class="card-title text-secondary" style="margin-bottom: 16px;">অফলাইন ও ক্যাশ (Cache &amp; Offline Storage)</h2>
        <div class="flex items-center justify-between" style="padding-bottom: 12px;">
          <div>
            <div class="font-bold text-body">অফলাইন সিঙ্ক ও ক্যাশ ডাটা</div>
            <div class="text-caption">শেষ সিঙ্ক: এখনও সিঙ্ক হয়নি</div>
          </div>
          <button type="button" id="btnSettingsSync" class="btn btn-sm btn-secondary">এখন সিঙ্ক করুন</button>
        </div>
        <p id="settingsSyncMsg" class="text-caption text-secondary" style="margin-top:8px;"></p>
        <div style="padding-top: 14px; border-top: 1px solid var(--color-border);">
          <div class="font-bold text-error" style="margin-bottom: 4px;">ক্যাশ ও অফলাইন ডাটা মুছুন (Clear Cache)</div>
          <p class="text-caption" style="margin-bottom: 12px;">এটি স্থানীয় সংরক্ষিত পরিকল্পনা ও ক্যাশ মুছে দেবে</p>
          <button type="button" id="btnClearCache" class="btn btn-danger btn-sm">ক্যাশ ও অফলাইন ডাটা মুছুন</button>
        </div>
      </section>
      <section class="card" aria-label="অ্যাক্সেসিবিলিটি ও সহায়তা">
        <h2 class="card-title text-primary" style="margin-bottom: 16px;">অ্যাক্সেসিবিলিটি ও সহায়তা</h2>
        <div class="flex items-center justify-between flex-wrap gap-8" style="padding-bottom: 12px;">
          <div>
            <div class="font-bold text-body">অ্যাক্সেসিবিলিটি মানদণ্ড</div>
            <div class="text-caption">WCAG 2.1 AA লক্ষ্য — স্ক্রিন রিডার ও কীবোর্ড নেভিগেশন সমর্থিত</div>
          </div>
          <span class="badge badge-verified">যাচাইকৃত</span>
        </div>
        <div style="padding-top: 12px; border-top: 1px solid var(--color-border);" class="flex gap-12 flex-wrap">
          <a href="../index.html" class="btn btn-sm btn-secondary">হোমে ফিরে যান</a>
          <button class="btn btn-sm btn-tertiary" onclick="alert('সহায়তা ইমেইল: help@folika.bd — প্রযুক্তিগত সমস্যায় আমাদের লিখুন')">সহায়তা ও যোগাযোগ</button>
        </div>
      </section>
    </div>"""
    return page_shell(
        "সেটিংস — ফলিকা",
        "ফলিকা সেটিংস — ভাষা, থিম, নোটিফিকেশন, অফলাইন সিঙ্ক ও অ্যাক্সেসিবিলিটি",
        "settingsMain",
        body,
        page_scripts=("geo-bd.js", "location.js"),
        tail_scripts=("settings-page.js",),
    )



def build_profile() -> str:
    body = PROFILE_BODY
    html = page_shell(
        "আমার প্রোফাইল — ফলিকা",
        "ফলিকা প্রোফাইল — পরিকল্পনা, আয়-ব্যয়, রোগ নির্ণয় ও নোটিফিকেশন",
        "profileMain",
        body,
        extra_css=("profile.css",),
    )
    extra = """  <script src="../js/api-client.js"></script>
  <script src="../js/offline-sync.js"></script>
  <script src="../js/profile-utils.js"></script>"""
    html = html.replace(
        '  <script src="../js/i18n.js"></script>',
        extra + '\n  <script src="../js/i18n.js"></script>',
        1,
    )
    return html.replace("</body>", '  <script src="../js/profile.js"></script>\n</body>', 1)


PROFILE_BODY = '''    <div class="container">

      <div id="profileSyncLine" class="profile-sync-line" role="status" aria-live="polite" style="margin-bottom: 16px;">
        <span class="profile-skeleton" style="width:60%;display:inline-block;">&nbsp;</span>
      </div>

      <section class="card profile-identity-card" style="margin-bottom: 20px;" aria-label="ব্যবহারকারী পরিচয়">
        <div class="flex items-center justify-between flex-wrap gap-16">
          <div class="flex items-center gap-16">
            <div id="profileAvatar" class="profile-avatar" aria-hidden="true">ম</div>
            <div>
              <div class="flex items-center gap-8 flex-wrap">
                <h1 id="profileName" class="text-h2" style="margin:0;"></h1>
                <span id="profileVerifiedBadge" class="badge badge-verified" style="display:none;">যাচাইকৃত</span>
              </div>
              <p id="profileLocation" class="text-body-sm text-secondary" style="margin-top:4px;"></p>
              <p id="profileMobile" class="text-caption text-secondary" style="margin-top:2px;"></p>
            </div>
          </div>
          <button type="button" id="btnEditIdentity" class="btn btn-primary" aria-label="পরিচয় সম্পাদনা">সম্পাদনা</button>
        </div>
        <div id="identityEditPanel" class="profile-inline-edit" aria-label="পরিচয় সম্পাদনা ফর্ম">
          <div class="form-group">
            <label class="form-label" for="editName">আপনার নাম</label>
            <input type="text" id="editName" class="form-control" maxlength="150" required>
            <span id="editNameErr" class="text-caption" style="color:var(--color-error);"></span>
          </div>
          <div class="flex gap-8 flex-wrap">
            <button type="button" id="btnSaveIdentity" class="btn btn-primary">সংরক্ষণ</button>
            <button type="button" id="btnCancelIdentity" class="btn btn-secondary">বাতিল</button>
          </div>
        </div>
      </section>

      <section id="profileNudge" class="profile-nudge" style="margin-bottom: 20px; display:none;" aria-label="প্রোফাইল সম্পূর্ণকরণ">
        <div class="flex justify-between items-center flex-wrap gap-8">
          <div>
            <strong id="profileNudgeTitle">প্রোফাইল সম্পূর্ণ করুন</strong>
            <p id="profileNudgeText" class="text-body-sm" style="margin:4px 0 0;">নাম যোগ করলে প্রোফাইল সম্পূর্ণ হবে</p>
          </div>
          <button type="button" id="btnNudgeAction" class="btn btn-sm btn-primary">এখনই করুন</button>
        </div>
        <div class="profile-progress-bar" aria-hidden="true"><div id="profileNudgeFill" class="profile-progress-fill" style="width:0%"></div></div>
      </section>

      <section class="grid grid-cols-1 grid-cols-md-3 gap-16" style="margin-bottom: 20px;" aria-label="আমার পরিকল্পনা">
        <div class="card card-domain-crop">
          <div class="flex justify-between items-center" style="margin-bottom:8px;">
            <h3 class="card-title text-crop">ফসল পরিকল্পনা</h3>
            <span id="cropPlanCount" class="badge badge-crop">০</span>
          </div>
          <div id="cropPlanPreview"></div>
          <a href="profile-crops.html" class="btn btn-sm btn-secondary btn-block" style="margin-top:8px;">সব দেখুন</a>
        </div>
        <div class="card card-domain-fish">
          <div class="flex justify-between items-center" style="margin-bottom:8px;">
            <h3 class="card-title text-fish">মৎস্য পরিকল্পনা</h3>
            <span id="fishPlanCount" class="badge badge-fish">০</span>
          </div>
          <div id="fishPlanPreview"></div>
          <a href="profile-fish.html" class="btn btn-sm btn-secondary btn-block" style="margin-top:8px;">সব দেখুন</a>
        </div>
        <div class="card card-domain-livestock">
          <div class="flex justify-between items-center" style="margin-bottom:8px;">
            <h3 class="card-title text-livestock">প্রাণিসম্পদ পরিকল্পনা</h3>
            <span id="livestockPlanCount" class="badge badge-livestock">০</span>
          </div>
          <div id="livestockPlanPreview"></div>
          <a href="profile-livestock.html" class="btn btn-sm btn-secondary btn-block" style="margin-top:8px;">সব দেখুন</a>
        </div>
      </section>

      <section class="card" style="margin-bottom: 20px;" aria-label="আর্থিক সারাংশ" id="profileLedger">
        <h2 class="text-h3 text-primary" style="margin-bottom:12px;">আর্থিক সারাংশ</h2>
        <div class="grid grid-cols-1 grid-cols-sm-3 gap-16">
          <div class="card" style="background:var(--color-error-tint);border:1px solid var(--color-error);text-align:center;margin:0;">
            <div class="text-caption" style="color:var(--color-error);">মোট খরচ</div>
            <div id="ledgerCost" class="text-h2 font-bold" style="color:var(--color-error);"></div>
          </div>
          <div class="card" style="text-align:center;margin:0;">
            <div class="text-caption text-secondary">মোট আয়</div>
            <div id="ledgerRevenue" class="text-h2 font-bold text-secondary"></div>
          </div>
          <div class="card" style="background:var(--color-primary-tint);border:2px solid var(--color-primary);text-align:center;margin:0;">
            <div class="text-caption text-primary">নিট লাভ</div>
            <div id="ledgerProfit" class="text-h1 font-bold text-primary"></div>
          </div>
        </div>
      </section>

      <section class="card" style="margin-bottom: 20px;" aria-label="রোগ নির্ণয় ইতিহাস">
        <div class="flex justify-between items-center" style="margin-bottom:12px;">
          <h2 class="text-h3 text-primary" style="margin:0;">সাম্প্রতিক রোগ নির্ণয়</h2>
          <a href="profile-diagnoses.html" class="btn btn-sm btn-secondary">সব দেখুন</a>
        </div>
        <div id="diagnosisPreview"></div>
      </section>

      <section class="card" style="margin-bottom: 20px;" aria-label="নোটিফিকেশন">
        <div class="flex justify-between items-center flex-wrap gap-8" style="margin-bottom:12px;">
          <h2 class="text-h3" style="margin:0;">নোটিফিকেশন</h2>
          <label class="flex items-center gap-8" style="min-height:44px;">
            <input type="checkbox" id="notifyPushToggle" aria-label="পুশ নোটিফিকেশন চালু বা বন্ধ">
            <span class="text-body-sm">পুশ নোটিফিকেশন</span>
          </label>
        </div>
        <a href="profile-notifications.html" class="btn btn-sm btn-primary btn-block">সব নোটিফিকেশন</a>
      </section>

      <section class="card profile-security" aria-label="অ্যাকাউন্ট ও নিরাপত্তা">
        <h2 class="text-h3" style="margin-bottom:12px;">অ্যাকাউন্ট</h2>
        <div class="flex flex-col gap-8">
          <a href="settings.html" class="btn btn-secondary btn-block">সেটিংস ও ভাষা</a>
          <button type="button" id="btnLogout" class="btn btn-secondary btn-block">এই ডিভাইস থেকে লগআউট</button>
          <button type="button" id="btnLogoutAll" class="btn btn-secondary btn-block">সব ডিভাইস থেকে লগআউট</button>
          <button type="button" id="btnDeleteAccount" class="btn btn-sm" style="color:var(--color-error);border:1px solid var(--color-error);">অ্যাকাউন্ট মুছুন</button>
        </div>
      </section>

    </div>'''


def build_fish() -> str:
    body = FISH_BODY
    html = page_shell(
        "মৎস্য পরিকল্পনা — ফলিকা",
        "ফলিকা মৎস্য পরিকল্পনা — পুকুরের মাপ, স্তরভিত্তিক মাছ ও খাদ্য তালিকা",
        "fishMain",
        body,
        page_scripts=("geo-bd.js", "location.js", "fish-data.js", "fish-plan.js"),
    )
    modals = FISH_MODALS
    return html.replace("  </main>", modals + "\n  </main>", 1)


FISH_BODY = '''    <div class="container" id="fishPlanRoot">
      <div class="plan-page-stack" style="margin-bottom: 16px;">
        <div class="folika-location-mount" id="fishLocationMount"></div>
        <div class="plan-tabs-bar" id="fishPlanTabs"></div>
      </div>
      <section class="plan-inputs-bar" aria-label="পুকুরের মাপ">
        <div>
          <label class="form-label" for="fishPondLength">পুকুরের দৈর্ঘ্য (ফুট):</label>
          <input type="number" id="fishPondLength" class="form-control" value="150" placeholder="ফুট">
        </div>
        <div>
          <label class="form-label" for="fishPondWidth">পুকুরের প্রস্থ (ফুট):</label>
          <input type="number" id="fishPondWidth" class="form-control" value="100" placeholder="ফুট">
        </div>
        <div>
          <label class="form-label" for="fishPondDepth">গড় গভীরতা (ফুট):</label>
          <div class="flex gap-8 flex-wrap items-end">
            <input type="number" id="fishPondDepth" class="form-control" value="6" min="1" step="1" inputmode="numeric" placeholder="যেমন ৬" aria-describedby="fishDepthHint" style="flex:1;min-width:120px;">
            <button type="button" id="btnFishCalcLayers" class="btn btn-primary" style="min-height:48px;">স্তর হিসাব</button>
          </div>
          <span id="fishDepthHint" class="text-caption text-secondary">গভীরতা দিয়ে «স্তর হিসাব» চাপলে উপযুক্ত মাছের স্তর সাজানো হবে</span>
        </div>
        <div>
          <label class="form-label" for="fishCultureDuration">চাষের মেয়াদ:</label>
          <select id="fishCultureDuration" class="form-control">
            <option value="1year" selected>১ বছর (পূর্ণ চক্র)</option>
            <option value="6months">৬ মাস (এক্সটেন্সিভ)</option>
            <option value="multi">মাল্টি-স্পিশিজ পলিকালচার</option>
          </select>
        </div>
      </section>
      <section class="card" style="background: var(--color-fish-tint); border: 2px solid var(--color-fish); margin-bottom: 20px;">
        <div class="flex items-center justify-between flex-wrap gap-12">
          <div>
            <span class="text-caption font-bold text-fish">গভীরতা অনুযায়ী মাছের স্তর:</span>
            <div id="fishLayerCountDisplay" class="text-h3 font-bold" style="color: var(--color-fish); margin-top: 4px;">৩ টি স্তর (উপর, মাঝ ও নিচে ভিন্ন মাছ রাখুন)</div>
          </div>
          <div class="text-right">
            <div class="text-caption">মোট পুকুর এলাকা:</div>
            <div id="fishPondAreaDisplay" class="text-body font-bold text-fish"></div>
          </div>
        </div>
      </section>
      <section id="fishLayerBoxesContainer" class="grid grid-cols-1 grid-cols-md-3 gap-16" style="margin-bottom: 24px;" aria-label="স্তরভিত্তিক মাছ ও খাদ্য তালিকা"></section>
      <section class="card card-domain-fish" style="margin-bottom: 24px;" aria-label="পুকুর প্রস্তুতি ও পানি মান">
        <div class="card-header">
          <h2 class="card-title text-fish">পুকুর প্রস্তুতি ও পানি মান (চুন, গobar ও সার)</h2>
          <span class="badge badge-fish" id="fishPrepBadge">পুকুর প্রস্তুতি সুপারিশ</span>
        </div>
        <div class="table-wrapper">
          <table class="table" aria-label="পুকুর প্রস্তুতি তালিকা">
            <thead>
              <tr>
                <th>উপাদান / কাজ</th>
                <th>প্রস্তাবিত পরিমাণ</th>
                <th>প্রয়োগ ও সময়</th>
                <th>উদ্দেশ্য</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>চুন (কাঁচা / পোড়া)</strong></td>
                <td id="fishLimeDose">পুকুরের আকার অনুযায়ী</td>
                <td>মাছ ছাড়ার ৭–১০ দিন আগে ছড়িয়ে দিন</td>
                <td>পুকুর জীবাণুমুক্ত ও pH ঠিক রাখে</td>
              </tr>
              <tr>
                <td><strong>গোবর/জৈব সার</strong></td>
                <td id="fishDungDose">পুকুরের ২–৩ সেমি</td>
                <td>প্লাংকটন বৃদ্ধির জন্য</td>
                <td>প্রাকৃতিক খাদ্য তৈরি</td>
              </tr>
              <tr>
                <td><strong>ইউরিয়া ও TSP</strong></td>
                <td id="fishUreaDose">ইউরিয়া ২ কেজি + TSP ১ কেজি / বিঘা</td>
                <td>পানিতে প্লাংকটন বাড়ায়</td>
                <td>মাছের প্রাকৃতik খাদ্য</td>
              </tr>
              <tr>
                <td><strong>জিওলাইট ও KMnO4</strong></td>
                <td id="fishZeoliteDose">প্রয়োজন অনুযায়ী</td>
                <td>অ্যামোনিয়া ও গন্ধ কমায়</td>
                <td>পানির গুণমান রক্ষা</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="alert alert-info" style="margin-bottom: 0;">
          <div class="alert-content">
            <h4 class="alert-title font-bold">গুরুত্বপূর্ণ পরামর্শ:</h4>
            <ul style="padding-left: 18px; margin-top: 4px; line-height: 1.7;">
              <li><strong>পানি বিনিময়:</strong> গভীর পুকুরে ১০–১৫% পানি সাপ্তাহিক বদলান</li>
              <li><strong>অক্সিজেন:</strong> রাতে অক্সিজেন কমলে এরিয়েটর চালু রাখুন</li>
              <li><strong>খাদ্য তালিকা:</strong> মাছের ওজন অনুযায়ী দৈনিক খাদ্য দিন</li>
            </ul>
          </div>
        </div>
      </section>
      <section class="plan-actions-bar">
        <button class="btn btn-primary btn-plan-action" data-modal-target="#fishReminderModal">রিমাইন্ডার</button>
        <button type="button" class="btn btn-secondary btn-plan-action" id="btnEditFishPlan">পরিকল্পনা সম্পাদনা</button>
        <button class="btn btn-danger btn-plan-action" id="btnDeleteFishPlan">পরিকল্পনা মুছুন</button>
      </section>
      <div style="margin-top: 24px;">
        <button type="button" class="btn btn-primary btn-lg" id="btnAddFishPlanBottom">+ নতুন মৎস্য পরিকল্পনা যোগ করুন</button>
        <p id="fishSyncStatus" class="text-caption text-secondary" style="margin-top: 8px;"></p>
      </div>
    </div>'''

FISH_MODALS = '''
  <div id="fishEditPlanModal" class="modal-backdrop" aria-hidden="true" role="dialog" aria-modal="true">
    <div class="modal-container">
      <div class="modal-header">
        <h3 class="modal-title">মৎস্য পরিকল্পনা সম্পাদনা</h3>
        <button class="modal-close-btn" data-modal-close aria-label="বন্ধ করুন">বন্ধ</button>
      </div>
      <div class="modal-body">
        <form id="fishEditPlanForm">
          <div class="form-group">
            <label class="form-label" for="fishEditName">পরিকল্পনার নাম</label>
            <input type="text" id="fishEditName" class="form-control" required maxlength="80">
          </div>
          <div class="form-group">
            <label class="form-label" for="fishEditLength">পুকুরের দৈর্ঘ্য (ফুট)</label>
            <input type="number" id="fishEditLength" class="form-control" min="1" step="0.1" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="fishEditWidth">পুকুরের প্রস্থ (ফুট)</label>
            <input type="number" id="fishEditWidth" class="form-control" min="1" step="0.1" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="fishEditDepth">গড় গভীরতা (ফুট)</label>
            <input type="number" id="fishEditDepth" class="form-control" min="0.5" step="0.1" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="fishEditDuration">চাষের মেয়াদ</label>
            <select id="fishEditDuration" class="form-control">
              <option value="1year">১ বছর (পূর্ণ চক্র)</option>
              <option value="6months">৬ মাস (এক্সটেন্সিভ)</option>
              <option value="multi">মাল্টি-স্পিশিজ পলিকালচার</option>
            </select>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-modal-close>বাতিল</button>
            <button type="submit" class="btn btn-primary">সংরক্ষণ করুন</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div id="fishReminderModal" class="modal-backdrop" aria-hidden="true" role="dialog" aria-modal="true">
    <div class="modal-container">
      <div class="modal-header">
        <h3 class="modal-title">মৎস্য পরিকল্পনা রিমাইন্ডার</h3>
        <button class="modal-close-btn" data-modal-close aria-label="বন্ধ করুন">বন্ধ</button>
      </div>
      <div class="modal-body">
        <form id="fishReminderForm">
          <p id="fishReminderStatus" class="text-caption text-secondary" style="margin-bottom: 8px;"></p>
          <ul id="fishReminderList" class="text-body-sm" style="padding-left: 18px; margin-bottom: 12px; line-height: 1.7;"></ul>
          <div class="form-group">
            <label class="form-label" for="fishRemindTask">কাজের ধরন</label>
            <select id="fishRemindTask" class="form-control">
              <option value="lime">চুন ও জীবাণুমুক্তকরণ</option>
              <option value="feed">দৈনিক খাদ্য ও স্তরভিত্তিক খাওয়ানো</option>
              <option value="water">পানির ১০% বিনিময়</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="fishRemindDate">তারিখ</label>
            <input type="date" id="fishRemindDate" class="form-control" required>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-modal-close>বাতিল</button>
            <button type="submit" class="btn btn-primary">সংরক্ষণ করুন</button>
          </div>
        </form>
      </div>
    </div>
  </div>
'''


def build_community() -> str:
    body = COMMUNITY_BODY
    return page_shell(
        "কমিউনিটি — ফলিকা",
        "ফলিকা কমিউনিটি — কৃষি অফিস, প্রশিক্ষণ ও ডিলার তালিকা",
        "communityMain",
        body,
        page_scripts=("geo-bd.js", "location.js"),
    )


COMMUNITY_BODY = '''    <div class="container">
      <div class="section-header" style="margin-bottom: 20px;">
        <div>
          <h1 class="text-h1">কমিউনিটি</h1>
          <p class="text-body text-secondary">কৃষি বিশেষজ্ঞ, ফোরাম ও স্থানীয় সেবা</p>
        </div>
      </div>
      <div class="community-3col-grid">
        <div class="community-col">
          <div class="community-col-header">
            <h2 class="text-h3 text-primary">১. অফিস ও হটলাইন</h2>
            <p class="text-caption">আপনার এলাকার কৃষি/পশু/মৎস্য অফিস</p>
          </div>
          <div class="folika-location-mount" id="communityLocationMount" style="margin-bottom: 12px;"></div>
          <div class="card card-domain-govt" style="padding: 12px; margin: 0;">
            <span class="badge badge-govt">উপজেলা কৃষি অফিস</span>
            <h3 class="font-bold text-body" style="color: var(--color-govt);">শেরপুর উপজেলা, বগুড়া</h3>
            <p class="text-body-sm text-secondary" style="margin: 4px 0 8px;">কৃষি কর্মকর্তা: মোঃ করিম উদ্দিন<br>ঠিকানা: উপজেলা কমপ্লেক্স, শেরপুর</p>
            <a href="tel:01711000000" class="btn btn-sm btn-domain-govt">কল: ০১৭XXXXXXXX</a>
          </div>
          <div class="card card-domain-livestock" style="padding: 12px; margin: 0;">
            <span class="badge badge-livestock">প্রাণিসম্পদ অফিস</span>
            <h3 class="font-bold text-body" style="color: var(--color-livestock);">উপজেলা ভেট সার্জন অফিস</h3>
            <p class="text-body-sm text-secondary" style="margin: 4px 0 8px;">ভেট সার্জন: ড. রহিম<br>ঠিকানা: সদর রোড, শেরপুর</p>
            <a href="tel:01811000000" class="btn btn-sm btn-domain-livestock">কল: ০১৮XXXXXXXX</a>
          </div>
          <div class="card card-domain-fish" style="padding: 12px; margin: 0;">
            <span class="badge badge-fish">মৎস্য অফিস</span>
            <h3 class="font-bold text-body" style="color: var(--color-fish);">উপজেলা মৎস্য সম্প্রসারণ</h3>
            <p class="text-body-sm text-secondary" style="margin: 4px 0 8px;">মৎস্য কর্মকর্তা: মোঃ সালাম<br>ঠিকানা: বাজার রোড, শেরপুর</p>
            <a href="tel:01911000000" class="btn btn-sm btn-domain-fish">কল: ০১৯XXXXXXXX</a>
          </div>
          <div class="card" style="background: var(--color-accent-tint); border: 1px solid var(--color-accent); padding: 12px; margin: 0;">
            <h3 class="text-caption font-bold text-dealer">জাতীয় হটলাইন:</h3>
            <div class="flex justify-between text-body-sm font-semibold" style="margin-bottom: 4px;">
              <span>কৃষি তথ্য:</span><a href="tel:16123" class="text-error font-bold">১৬১২৩</a>
            </div>
            <div class="flex justify-between text-body-sm font-semibold">
              <span>প্রাণিসম্পদ:</span><a href="tel:10655" class="text-error font-bold">১০৬৫৫</a>
            </div>
          </div>
        </div>
        <div class="community-col">
          <div class="community-col-header">
            <h2 class="text-h3 text-crop">২. প্রশিক্ষণ ও কর্মশালা</h2>
            <p class="text-caption">সরকারি ও এনজিও প্রশিক্ষণ</p>
          </div>
          <div class="card card-domain-crop" style="padding: 14px; margin: 0;">
            <span class="badge badge-crop">ফসল</span>
            <h3 class="font-bold text-body">ধানের উচ্চফলন ও জৈব সার ব্যবহার</h3>
            <p class="text-body-sm text-secondary">স্থান: BRRI, গাজীপুর — তারিখ: ১৫ সেপ্টেম্বর</p>
            <button class="btn btn-sm btn-domain-crop">অংশগ্রহণের আগ্রহ</button>
          </div>
          <div class="card card-domain-fish" style="padding: 14px; margin: 0;">
            <span class="badge badge-fish">মৎস্য</span>
            <h3 class="font-bold text-body">পলিকালচার ও স্তরভিত্তিক চাষ</h3>
            <p class="text-body-sm text-secondary">স্থান: মৎস্য প্রশিক্ষণ কেন্দ্র — ২০ সেপ্টেম্বর</p>
            <button class="btn btn-sm btn-domain-fish">অংশগ্রহণের আগ্রহ</button>
          </div>
          <div class="card card-domain-livestock" style="padding: 14px; margin: 0;">
            <span class="badge badge-livestock">প্রাণিসম্পদ</span>
            <h3 class="font-bold text-body">দুগ্ধবতী গাভীর খাদ্য ও স্বাস্থ্য</h3>
            <p class="text-body-sm text-secondary">স্থান: উপজেলা ভেট ক্লিনিক — ২৫ সেপ্টেম্বর</p>
            <button class="btn btn-sm btn-domain-livestock">অংশগ্রহণের আগ্রহ</button>
          </div>
        </div>
        <div class="community-col">
          <div class="community-col-header">
            <h2 class="text-h3 text-dealer">৩. ডিলার তালিকা</h2>
            <p class="text-caption">জেলা, উপজেলা ও খাত অনুযায়ী ফিল্টার</p>
          </div>
          <div class="card" style="background: var(--color-bg-secondary); padding: 12px; margin: 0;">
            <div class="form-group" style="margin-bottom: 8px;">
              <label class="form-label" for="dealerZilaSelect">জেলা:</label>
              <select id="dealerZilaSelect" class="form-control">
                <option value="bogra" selected>বগুড়া</option>
                <option value="dhaka">ঢাকা</option>
                <option value="rajshahi">রাজশাহী</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 8px;">
              <label class="form-label" for="dealerUpazilaSelect">উপজেলা:</label>
              <select id="dealerUpazilaSelect" class="form-control">
                <option value="sherpur" selected>শেরপুর</option>
                <option value="sodor">সদর</option>
                <option value="shibganj">শিবগঞ্জ</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 8px;">
              <label class="form-label" for="dealerSectorSelect">খাত:</label>
              <select id="dealerSectorSelect" class="form-control">
                <option value="all">সব খাত</option>
                <option value="crop" selected>ফসল</option>
                <option value="fish">মৎস্য</option>
                <option value="livestock">প্রাণিসম্পদ</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="dealerItemSelect">পণ্য:</label>
              <select id="dealerItemSelect" class="form-control">
                <option value="all">সব পণ্য</option>
                <option value="fert">সার ও রাসায়নিক</option>
                <option value="seed">বীজ</option>
                <option value="pesticide">কীটনাশক</option>
                <option value="fish_feed">মাছের খাদ্য</option>
                <option value="cattle_feed">গবাদি খাদ্য</option>
              </select>
            </div>
          </div>
          <div class="flex flex-col gap-12" id="dealerResultsList">
            <div class="card dealer-result-card" data-sector="crop" data-item="seed" data-zila="bogra" data-upazila="sherpur">
              <span class="badge badge-verified">BCIC অনুমোদিত</span>
              <h3 class="font-bold text-body">শেরপুর কৃষি সমবায়</h3>
              <p class="text-body-sm text-secondary">বীজ, সার ও কীটনাশক — শেরপুর বাজার</p>
              <a href="tel:01711111111" class="btn btn-sm btn-domain-crop">কল: ০১৭১-XXXXXX</a>
            </div>
            <div class="card dealer-result-card" data-sector="crop" data-item="seed" data-zila="bogra" data-upazila="sherpur">
              <span class="badge badge-verified">BADC বীজ ডিলার</span>
              <h3 class="font-bold text-body">আল-আমিন এগ্রো</h3>
              <p class="text-body-sm text-secondary">উচ্চমানের ধান ও সবজির বীজ</p>
              <a href="tel:01822222222" class="btn btn-sm btn-domain-crop">কল: ০১৮২-XXXXXX</a>
            </div>
            <div class="card dealer-result-card" data-sector="fish" data-item="feed" data-zila="bogra" data-upazila="sherpur">
              <span class="badge badge-fish">মাছের খাদ্য</span>
              <h3 class="font-bold text-body">নিউ ফিশ ফিড সেন্টার</h3>
              <p class="text-body-sm text-secondary">পেলেট ও পাউডার খাদ্য</p>
              <a href="tel:01933333333" class="btn btn-sm btn-domain-fish">কল: ০১৯৩-XXXXXX</a>
            </div>
          </div>
        </div>
      </div>
    </div>'''


def build_all_pages():
    pages = {
        "crop.html": build_crop(),
        "livestock.html": build_livestock(),
        "login.html": build_login(),
        "disease.html": build_disease(),
        "govt.html": build_govt(),
        "settings.html": build_settings(),
        "profile.html": build_profile(),
        "fish.html": build_fish(),
        "community.html": build_community(),
        "profile-crops.html": profile_minimal(
            "list-crops", "ফসল পরিকল্পনা — ফলিকা", "ফসল পরিকল্পনা",
            "profile.html", "← প্রোফাইল", with_pager=True,
        ),
        "profile-crop-detail.html": profile_minimal(
            "detail-crop", "ফসল বিস্তারিত — ফলিকা", "ফসল পরিকল্পনা বিস্তারিত",
            "profile-crops.html", "← ফসল পরিকল্পনা",
        ),
        "profile-fish.html": profile_minimal(
            "list-fish", "মৎস্য পরিকল্পনা — ফলিকা", "মৎস্য পরিকল্পনা",
            "profile.html", "← প্রোফাইল", with_pager=True,
        ),
        "profile-fish-detail.html": profile_minimal(
            "detail-fish", "মৎস্য বিস্তারিত — ফলিকা", "মৎস্য পরিকল্পনা বিস্তারিত",
            "profile-fish.html", "← মৎস্য পরিকল্পনা",
        ),
        "profile-livestock.html": profile_minimal(
            "list-livestock", "প্রাণিসম্পদ পরিকল্পনা — ফলিকা", "প্রাণিসম্পদ পরিকল্পনা",
            "profile.html", "← প্রোফাইল", with_pager=True,
        ),
        "profile-livestock-detail.html": profile_minimal(
            "detail-livestock", "প্রাণিসম্পদ বিস্তারিত — ফলিকা", "প্রাণিসম্পদ পরিকল্পনা বিস্তারিত",
            "profile-livestock.html", "← প্রাণিসম্পদ পরিকল্পনা",
        ),
        "profile-diagnoses.html": profile_minimal(
            "list-diagnoses", "রোগ নির্ণয় ইতিহাস — ফলিকা", "রোগ নির্ণয় ইতিহাস",
            "profile.html", "← প্রোফাইল", with_pager=True,
        ),
        "profile-diagnosis-detail.html": profile_minimal(
            "detail-diagnosis", "রোগ নির্ণয় বিস্তারিত — ফলিকা", "রোগ নির্ণয় বিস্তারিত",
            "profile-diagnoses.html", "← ইতিহাস",
        ),
        "profile-notifications.html": profile_minimal(
            "list-notifications", "নোটিফিকেশন — ফলিকা", "সব নোটিফিকেশন",
            "profile.html", "← প্রোফাইল", with_pager=True,
        ),
    }
    return pages


def main():
    import re
    import sys
    from pathlib import Path

    pages = build_all_pages()
    written = 0
    for name, html in pages.items():
        path = PAGES / name
        path.write_text(html, encoding="utf-8")
        written += 1
        print(f"  wrote {name}")

    corrupt = {}
    for path in sorted(PAGES.glob("*.html")):
        text = path.read_text(encoding="utf-8")
        count = len(re.findall(r"\?\?\?", text))
        if count:
            corrupt[path.name] = count

    print(f"\nTotal files written: {written}")
    if corrupt:
        print("Remaining ??? counts:")
        for name, count in corrupt.items():
            print(f"  {name}: {count}")
        sys.exit(1)
    print("Remaining ??? counts: 0 (all clean)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
