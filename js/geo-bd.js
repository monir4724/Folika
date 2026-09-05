/**
 * Bangladesh divisions, districts (with GPS centroids) and upazilas.
 * Used for cascading dropdowns and GPS reverse-fill.
 */
(function (global) {
  'use strict';

  const divisions = [
    { id: 1, name_bn: 'ঢাকা', name_en: 'Dhaka' },
    { id: 2, name_bn: 'রাজশাহী', name_en: 'Rajshahi' },
    { id: 3, name_bn: 'চট্টগ্রাম', name_en: 'Chattogram' },
    { id: 4, name_bn: 'খুলনা', name_en: 'Khulna' },
    { id: 5, name_bn: 'বরিশাল', name_en: 'Barishal' },
    { id: 6, name_bn: 'সিলেট', name_en: 'Sylhet' },
    { id: 7, name_bn: 'রংপুর', name_en: 'Rangpur' },
    { id: 8, name_bn: 'ময়মনসিংহ', name_en: 'Mymensingh' },
  ];

  /* district_id matches backend seeder 1–27; remaining 28–64 */
  const districts = [
    { id: 1, division_id: 2, name_bn: 'বগুড়া', name_en: 'Bogura', lat: 24.85, lon: 89.37 },
    { id: 2, division_id: 2, name_bn: 'রাজশাহী', name_en: 'Rajshahi', lat: 24.37, lon: 88.60 },
    { id: 3, division_id: 2, name_bn: 'পাবনা', name_en: 'Pabna', lat: 24.00, lon: 89.25 },
    { id: 4, division_id: 2, name_bn: 'সিরাজগঞ্জ', name_en: 'Sirajganj', lat: 24.45, lon: 89.70 },
    { id: 5, division_id: 2, name_bn: 'নাটোর', name_en: 'Natore', lat: 24.41, lon: 89.00 },
    { id: 6, division_id: 2, name_bn: 'নওগাঁ', name_en: 'Naogaon', lat: 24.80, lon: 88.95 },
    { id: 7, division_id: 2, name_bn: 'জয়পুরহাট', name_en: 'Joypurhat', lat: 25.10, lon: 89.02 },
    { id: 8, division_id: 2, name_bn: 'চাঁপাইনবাবগঞ্জ', name_en: 'Chapai Nawabganj', lat: 24.60, lon: 88.27 },
    { id: 9, division_id: 1, name_bn: 'ঢাকা', name_en: 'Dhaka', lat: 23.81, lon: 90.41 },
    { id: 10, division_id: 1, name_bn: 'গাজীপুর', name_en: 'Gazipur', lat: 24.00, lon: 90.43 },
    { id: 11, division_id: 1, name_bn: 'নারায়ণগঞ্জ', name_en: 'Narayanganj', lat: 23.62, lon: 90.50 },
    { id: 12, division_id: 1, name_bn: 'টাঙ্গাইল', name_en: 'Tangail', lat: 24.25, lon: 89.92 },
    { id: 13, division_id: 1, name_bn: 'মানিকগঞ্জ', name_en: 'Manikganj', lat: 23.86, lon: 90.00 },
    { id: 14, division_id: 8, name_bn: 'ময়মনসিংহ', name_en: 'Mymensingh', lat: 24.75, lon: 90.41 },
    { id: 15, division_id: 8, name_bn: 'জামালপুর', name_en: 'Jamalpur', lat: 24.92, lon: 89.95 },
    { id: 16, division_id: 8, name_bn: 'শেরপুর', name_en: 'Sherpur', lat: 25.02, lon: 90.02 },
    { id: 17, division_id: 8, name_bn: 'নেত্রকোণা', name_en: 'Netrokona', lat: 24.88, lon: 90.73 },
    { id: 18, division_id: 7, name_bn: 'রংপুর', name_en: 'Rangpur', lat: 25.74, lon: 89.25 },
    { id: 19, division_id: 7, name_bn: 'দিনাজপুর', name_en: 'Dinajpur', lat: 25.63, lon: 88.64 },
    { id: 20, division_id: 7, name_bn: 'কুড়িগ্রাম', name_en: 'Kurigram', lat: 25.81, lon: 89.65 },
    { id: 21, division_id: 3, name_bn: 'চট্টগ্রাম', name_en: 'Chattogram', lat: 22.36, lon: 91.78 },
    { id: 22, division_id: 3, name_bn: 'কুমিল্লা', name_en: 'Cumilla', lat: 23.46, lon: 91.18 },
    { id: 23, division_id: 3, name_bn: 'চাঁদপুর', name_en: 'Chandpur', lat: 23.23, lon: 90.66 },
    { id: 24, division_id: 4, name_bn: 'খুলনা', name_en: 'Khulna', lat: 22.85, lon: 89.54 },
    { id: 25, division_id: 4, name_bn: 'যশোর', name_en: 'Jashore', lat: 23.17, lon: 89.21 },
    { id: 26, division_id: 5, name_bn: 'বরিশাল', name_en: 'Barishal', lat: 22.70, lon: 90.35 },
    { id: 27, division_id: 6, name_bn: 'সিলেট', name_en: 'Sylhet', lat: 24.89, lon: 91.88 },
    { id: 28, division_id: 1, name_bn: 'মুন্সিগঞ্জ', name_en: 'Munshiganj', lat: 23.54, lon: 90.53 },
    { id: 29, division_id: 1, name_bn: 'নরসিংদী', name_en: 'Narsingdi', lat: 23.92, lon: 90.72 },
    { id: 30, division_id: 1, name_bn: 'কিশোরগঞ্জ', name_en: 'Kishoreganj', lat: 24.43, lon: 90.78 },
    { id: 31, division_id: 1, name_bn: 'ফরিদপুর', name_en: 'Faridpur', lat: 23.61, lon: 89.84 },
    { id: 32, division_id: 1, name_bn: 'গোপালগঞ্জ', name_en: 'Gopalganj', lat: 23.01, lon: 89.83 },
    { id: 33, division_id: 1, name_bn: 'মাদারীপুর', name_en: 'Madaripur', lat: 23.17, lon: 90.21 },
    { id: 34, division_id: 1, name_bn: 'রাজবাড়ী', name_en: 'Rajbari', lat: 23.76, lon: 89.65 },
    { id: 35, division_id: 1, name_bn: 'শরীয়তপুর', name_en: 'Shariatpur', lat: 23.24, lon: 90.35 },
    { id: 36, division_id: 3, name_bn: 'কক্সবাজার', name_en: "Cox's Bazar", lat: 21.43, lon: 92.01 },
    { id: 37, division_id: 3, name_bn: 'ফেনী', name_en: 'Feni', lat: 23.02, lon: 91.40 },
    { id: 38, division_id: 3, name_bn: 'লক্ষ্মীপুর', name_en: 'Lakshmipur', lat: 22.94, lon: 90.84 },
    { id: 39, division_id: 3, name_bn: 'নোয়াখালী', name_en: 'Noakhali', lat: 22.87, lon: 91.10 },
    { id: 40, division_id: 3, name_bn: 'ব্রাহ্মণবাড়িয়া', name_en: 'Brahmanbaria', lat: 23.96, lon: 91.11 },
    { id: 41, division_id: 3, name_bn: 'খাগড়াছড়ি', name_en: 'Khagrachhari', lat: 23.12, lon: 91.97 },
    { id: 42, division_id: 3, name_bn: 'রাঙ্গামাটি', name_en: 'Rangamati', lat: 22.65, lon: 92.18 },
    { id: 43, division_id: 3, name_bn: 'বান্দরবান', name_en: 'Bandarban', lat: 22.20, lon: 92.22 },
    { id: 44, division_id: 4, name_bn: 'বাগেরহাট', name_en: 'Bagerhat', lat: 22.66, lon: 89.79 },
    { id: 45, division_id: 4, name_bn: 'সাতক্ষীরা', name_en: 'Satkhira', lat: 22.72, lon: 89.07 },
    { id: 46, division_id: 4, name_bn: 'ঝিনাইদহ', name_en: 'Jhenaidah', lat: 23.54, lon: 89.17 },
    { id: 47, division_id: 4, name_bn: 'মাগুরা', name_en: 'Magura', lat: 23.49, lon: 89.42 },
    { id: 48, division_id: 4, name_bn: 'নড়াইল', name_en: 'Narail', lat: 23.17, lon: 89.51 },
    { id: 49, division_id: 4, name_bn: 'কুষ্টিয়া', name_en: 'Kushtia', lat: 23.90, lon: 89.12 },
    { id: 50, division_id: 4, name_bn: 'চুয়াডাঙ্গা', name_en: 'Chuadanga', lat: 23.64, lon: 88.85 },
    { id: 51, division_id: 4, name_bn: 'মেহেরপুর', name_en: 'Meherpur', lat: 23.76, lon: 88.63 },
    { id: 52, division_id: 5, name_bn: 'ভোলা', name_en: 'Bhola', lat: 22.69, lon: 90.65 },
    { id: 53, division_id: 5, name_bn: 'পটুয়াখালী', name_en: 'Patuakhali', lat: 22.36, lon: 90.33 },
    { id: 54, division_id: 5, name_bn: 'পিরোজপুর', name_en: 'Pirojpur', lat: 22.58, lon: 90.00 },
    { id: 55, division_id: 5, name_bn: 'ঝালকাঠি', name_en: 'Jhalokati', lat: 22.64, lon: 90.20 },
    { id: 56, division_id: 5, name_bn: 'বরগুনা', name_en: 'Barguna', lat: 22.16, lon: 90.12 },
    { id: 57, division_id: 6, name_bn: 'মৌলভীবাজার', name_en: 'Moulvibazar', lat: 24.48, lon: 91.77 },
    { id: 58, division_id: 6, name_bn: 'হবিগঞ্জ', name_en: 'Habiganj', lat: 24.37, lon: 91.42 },
    { id: 59, division_id: 6, name_bn: 'সুনামগঞ্জ', name_en: 'Sunamganj', lat: 25.07, lon: 91.40 },
    { id: 60, division_id: 7, name_bn: 'গাইবান্ধা', name_en: 'Gaibandha', lat: 25.33, lon: 89.54 },
    { id: 61, division_id: 7, name_bn: 'নীলফামারী', name_en: 'Nilphamari', lat: 25.93, lon: 88.85 },
    { id: 62, division_id: 7, name_bn: 'লালমনিরহাট', name_en: 'Lalmonirhat', lat: 25.92, lon: 89.45 },
    { id: 63, division_id: 7, name_bn: 'ঠাকুরগাঁও', name_en: 'Thakurgaon', lat: 26.03, lon: 88.47 },
    { id: 64, division_id: 7, name_bn: 'পঞ্চগড়', name_en: 'Panchagarh', lat: 26.33, lon: 88.56 },
  ];

  const U = (district_id, list) => list.map((x, i) => ({
    id: district_id * 100 + i + 1,
    district_id,
    name_bn: x[0],
    name_en: x[1],
  }));

  const upazilas = []
    .concat(U(1, [['বগুড়া সদর', 'Bogura Sadar'], ['শেরপুর', 'Sherpur'], ['শিবগঞ্জ', 'Shibganj'], ['ধুনট', 'Dhunat'], ['শাজাহানপুর', 'Shajahanpur'], ['গাবতলী', 'Gabtali'], ['কাহালু', 'Kahalu'], ['নন্দীগ্রাম', 'Nandigram'], ['সারিয়াকান্দি', 'Sariakandi'], ['সোনাতলা', 'Sonatola'], ['আদমদীঘি', 'Adamdighi'], ['দুপচাঁচিয়া', 'Dupchanchia']]))
    .concat(U(2, [['রাজশাহী সদর', 'Rajshahi Sadar'], ['পবা', 'Paba'], ['গোদাগাড়ী', 'Godagari'], ['তানোর', 'Tanore'], ['মোহনপুর', 'Mohonpur'], ['বাগমারা', 'Bagmara'], ['দুর্গাপুর', 'Durgapur'], ['চারঘাট', 'Charghat'], ['বাঘা', 'Bagha'], ['পুঠিয়া', 'Puthia']]))
    .concat(U(3, [['পাবনা সদর', 'Pabna Sadar'], ['ঈশ্বরদী', 'Ishwardi'], ['সাঁথিয়া', 'Santhia'], ['সুজানগর', 'Sujanagar'], ['বেড়া', 'Bera'], ['ভাঙ্গুড়া', 'Bhangura'], ['চাটমোহর', 'Chatmohar'], ['আটঘরিয়া', 'Atgharia'], ['ফরিদপুর', 'Faridpur']]))
    .concat(U(4, [['সিরাজগঞ্জ সদর', 'Sirajganj Sadar'], ['শাহজাদপুর', 'Shahjadpur'], ['উল্লাপাড়া', 'Ullapara'], ['কাজিপুর', 'Kazipur'], ['তাড়াশ', 'Tarash'], ['রায়গঞ্জ', 'Raiganj'], ['কামারখন্দ', 'Kamarkhanda'], ['বেলকুচি', 'Belkuchi'], ['চৌহালি', 'Chauhali']]))
    .concat(U(5, [['নাটোর সদর', 'Natore Sadar'], ['বাগাতিপাড়া', 'Bagatipara'], ['বড়াইগ্রাম', 'Baraigram'], ['গুরুদাসপুর', 'Gurudaspur'], ['লালপুর', 'Lalpur'], ['সিংড়া', 'Singra'], ['নলডাঙ্গা', 'Naldanga']]))
    .concat(U(6, [['নওগাঁ সদর', 'Naogaon Sadar'], ['আত্রাই', 'Atrai'], ['বদলগাছি', 'Badalgachhi'], ['ধামইরহাট', 'Dhamoirhat'], ['মান্দা', 'Manda'], ['মহাদেবপুর', 'Mahadebpur'], ['নিয়ামতপুর', 'Niamatpur'], ['পত্নীতলা', 'Patnitala'], ['পোরশা', 'Porsha'], ['রাণীনগর', 'Raninagar'], ['সাপাহার', 'Sapahar']]))
    .concat(U(7, [['জয়পুরহাট সদর', 'Joypurhat Sadar'], ['আক্কেলপুর', 'Akkelpur'], ['কালাই', 'Kalai'], ['ক্ষেতলাল', 'Khetlal'], ['পাঁচবিবি', 'Panchbibi']]))
    .concat(U(8, [['চাঁপাইনবাবগঞ্জ সদর', 'Chapai Nawabganj Sadar'], ['গোমস্তাপুর', 'Gomastapur'], ['নাচোল', 'Nachole'], ['শিবগঞ্জ', 'Shibganj'], ['ভোলাহাট', 'Bholahat']]))
    .concat(U(9, [
      ['সাভার', 'Savar'], ['ধামরাই', 'Dhamrai'], ['কেরানীগঞ্জ', 'Keraniganj'],
      ['নবাবগঞ্জ', 'Nawabganj'], ['দোহার', 'Dohar'], ['তেজগাঁও', 'Tejgaon'],
      ['সূত্রাপুর', 'Sutrapur'], ['কোতোয়ালি', 'Kotwali'], ['লালবাগ', 'Lalbagh'],
      ['চকবাজার', 'Chawkbazar'], ['বংশাল', 'Bangshal'], ['গেন্ডারিয়া', 'Gendaria'],
      ['ওয়ারী', 'Wari'], ['মতিঝিল', 'Motijheel'], ['রমনা', 'Ramna'],
      ['শাহবাগ', 'Shahbagh'], ['ধানমন্ডি', 'Dhanmondi'], ['মোহাম্মদপুর', 'Mohammadpur'],
      ['গুলশান', 'Gulshan'], ['মিরপুর', 'Mirpur'], ['উত্তরা', 'Uttara'],
      ['যাত্রাবাড়ী', 'Jatrabari'], ['ডেমরা', 'Demra'], ['কামরাঙ্গীরচর', 'Kamrangirchar'],
      ['ক্যান্টনমেন্ট', 'Cantonment'],
    ]))
    .concat(U(10, [['গাজীপুর সদর', 'Gazipur Sadar'], ['কালিয়াকৈর', 'Kaliakair'], ['কাপাসিয়া', 'Kapasia'], ['শ্রীপুর', 'Sreepur'], ['কালীগঞ্জ', 'Kaliganj']]))
    .concat(U(11, [['নারায়ণগঞ্জ সদর', 'Narayanganj Sadar'], ['আড়াইহাজার', 'Araihazar'], ['বন্দর', 'Bandar'], ['রূপগঞ্জ', 'Rupganj'], ['সোনারগাঁও', 'Sonargaon']]))
    .concat(U(12, [['টাঙ্গাইল সদর', 'Tangail Sadar'], ['বাসাইল', 'Basail'], ['ভূঞাপুর', 'Bhuapur'], ['ঘাটাইল', 'Ghatail'], ['গোপালপুর', 'Gopalpur'], ['কালিহাতী', 'Kalihati'], ['মির্জাপুর', 'Mirzapur'], ['নাগরপুর', 'Nagarpur'], ['সখিপুর', 'Sakhipur'], ['দেলদুয়ার', 'Delduar'], ['ধনবাড়ী', 'Dhanbari'], ['মধুপুর', 'Madhupur']]))
    .concat(U(13, [['মানিকগঞ্জ সদর', 'Manikganj Sadar'], ['সিংগাইর', 'Singair'], ['সাটুরিয়া', 'Saturia'], ['হরিরামপুর', 'Harirampur'], ['ঘিওর', 'Ghior'], ['শিবালয়', 'Shivalaya'], ['দৌলতপুর', 'Daulatpur']]))
    .concat(U(14, [['ময়মনসিংহ সদর', 'Mymensingh Sadar'], ['মুক্তাগাছা', 'Muktagacha'], ['ত্রিশাল', 'Trishal'], ['গফরগাঁও', 'Gafargaon'], ['ঈশ্বরগঞ্জ', 'Ishwarganj'], ['ফুলবাড়িয়া', 'Phulbaria'], ['নান্দাইল', 'Nandail'], ['হালুয়াঘাট', 'Haluaghat'], ['ধোবাউড়া', 'Dhobaura'], ['ফুলপুর', 'Phulpur'], ['গৌরীপুর', 'Gauripur'], ['ভালুকা', 'Bhaluka'], ['তারাকান্দা', 'Tarakanda']]))
    .concat(U(15, [['জামালপুর সদর', 'Jamalpur Sadar'], ['মেলান্দহ', 'Melandaha'], ['ইসলামপুর', 'Islampur'], ['দেওয়ানগঞ্জ', 'Dewanganj'], ['সরিষাবাড়ী', 'Sarishabari'], ['মাদারগঞ্জ', 'Madarganj'], ['বকশীগঞ্জ', 'Bokshiganj']]))
    .concat(U(16, [['শেরপুর সদর', 'Sherpur Sadar'], ['নকলা', 'Nakla'], ['নালিতাবাড়ী', 'Nalitabari'], ['ঝিনাইগাতী', 'Jhenaigati'], ['শ্রীবরদী', 'Sreebardi']]))
    .concat(U(17, [['নেত্রকোণা সদর', 'Netrokona Sadar'], ['বারহাট্টা', 'Barhatta'], ['খালিয়াজুরী', 'Khaliajuri'], ['কেন্দুয়া', 'Kendua'], ['আটপাড়া', 'Atpara'], ['মদন', 'Madan'], ['মোহনগঞ্জ', 'Mohanganj'], ['পূর্বধলা', 'Purbadhala'], ['কলমাকান্দা', 'Kalmakanda'], ['দুর্গাপুর', 'Durgapur']]))
    .concat(U(18, [['রংপুর সদর', 'Rangpur Sadar'], ['গংগাচড়া', 'Gangachara'], ['তারাগঞ্জ', 'Taraganj'], ['বদরগঞ্জ', 'Badarganj'], ['মিঠাপুকুর', 'Mithapukur'], ['পীরগঞ্জ', 'Pirganj'], ['কাউনিয়া', 'Kaunia'], ['পীরগাছা', 'Pirgacha']]))
    .concat(U(19, [['দিনাজপুর সদর', 'Dinajpur Sadar'], ['বিরল', 'Biral'], ['বোচাগঞ্জ', 'Bochaganj'], ['চিরিরবন্দর', 'Chirirbandar'], ['ফুলবাড়ী', 'Phulbari'], ['ঘোড়াঘাট', 'Ghoraghat'], ['হাকিমপুর', 'Hakimpur'], ['কাহারোল', 'Kaharole'], ['খানসামা', 'Khansama'], ['নবাবগঞ্জ', 'Nawabganj'], ['পার্বতীপুর', 'Parbatipur'], ['বিরল', 'Birganj'], ['বিরামপুর', 'Birampur']]))
    .concat(U(20, [['কুড়িগ্রাম সদর', 'Kurigram Sadar'], ['নাগেশ্বরী', 'Nageshwari'], ['ভুরুঙ্গামারী', 'Bhurungamari'], ['ফুলবাড়ী', 'Phulbari'], ['রাজারহাট', 'Rajarhat'], ['উলিপুর', 'Ulipur'], ['চিলমারী', 'Chilmari'], ['রৌমারী', 'Raumari'], ['চর রাজিবপুর', 'Char Rajibpur']]))
    .concat(U(21, [['চট্টগ্রাম সদর', 'Chattogram Sadar'], ['পটিয়া', 'Patiya'], ['সীতাকুণ্ড', 'Sitakunda'], ['মীরসরাই', 'Mirsharai'], ['হাটহাজারী', 'Hathazari'], ['রাউজান', 'Raozan'], ['রংগুনিয়া', 'Rangunia'], ['সন্দ্বীপ', 'Sandwip'], ['সাতকানিয়া', 'Satkania'], ['লোহাগাড়া', 'Lohagara'], ['বাঁশখালী', 'Banshkhali'], ['ফটিকছড়ি', 'Fatikchhari'], ['আনোয়ারা', 'Anwara'], ['চন্দনাইশ', 'Chandanaish'], ['বোয়ালখালী', 'Boalkhali']]))
    .concat(U(22, [['কুমিল্লা সদর', 'Cumilla Sadar'], ['দেবিদ্বার', 'Debidwar'], ['বরুড়া', 'Barura'], ['ব্রাহ্মণপাড়া', 'Brahmanpara'], ['চান্দিনা', 'Chandina'], ['চৌদ্দগ্রাম', 'Chauddagram'], ['দাউদকান্দি', 'Daudkandi'], ['হোমনা', 'Homna'], ['লাকসাম', 'Laksam'], ['মুরাদনগর', 'Muradnagar'], ['নাঙ্গলকোট', 'Nangalkot'], ['মেঘনা', 'Meghna'], ['মনোহরগঞ্জ', 'Monohorganj'], ['তিতাস', 'Titas'], ['বুড়িচং', 'Burichang']]))
    .concat(U(23, [['চাঁদপুর সদর', 'Chandpur Sadar'], ['হাজীগঞ্জ', 'Hajiganj'], ['শাহরাস্তি', 'Shahrasti'], ['কচুয়া', 'Kachua'], ['ফরিদগঞ্জ', 'Faridganj'], ['মতলব উত্তর', 'Matlab Uttar'], ['মতলব দক্ষিণ', 'Matlab Dakshin'], ['হাইমচর', 'Haimchar']]))
    .concat(U(24, [['খুলনা সদর', 'Khulna Sadar'], ['ডুমুরিয়া', 'Dumuria'], ['তেরখাদা', 'Terokhada'], ['ফুলতলা', 'Phultala'], ['পাইকগাছা', 'Paikgacha'], ['রূপসা', 'Rupsha'], ['দিঘলিয়া', 'Dighalia'], ['কয়রা', 'Koyra'], ['ডাকোপ', 'Dacope'], ['বটিয়াঘাটা', 'Batiaghata']]))
    .concat(U(25, [['যশোর সদর', 'Jashore Sadar'], ['অভয়নগর', 'Abhaynagar'], ['কেশবপুর', 'Keshabpur'], ['চৌগাছা', 'Chaugachha'], ['ঝিকরগাছা', 'Jhikargacha'], ['মণিরামপুর', 'Manirampur'], ['শার্শা', 'Sharsha'], ['বাঘারপাড়া', 'Bagherpara']]))
    .concat(U(26, [['বরিশাল সদর', 'Barishal Sadar'], ['বাকেরগঞ্জ', 'Bakerganj'], ['বাবুগঞ্জ', 'Babuganj'], ['উজিরপুর', 'Wazirpur'], ['বানারীপাড়া', 'Banaripara'], ['গৌরনদী', 'Gournadi'], ['আগৈলঝাড়া', 'Agailjhara'], ['মেহেন্দিগঞ্জ', 'Mehendiganj'], ['মুলাদী', 'Muladi'], ['হিজলা', 'Hizla']]))
    .concat(U(27, [['সিলেট সদর', 'Sylhet Sadar'], ['বালাগঞ্জ', 'Balaganj'], ['বিয়ানীবাজার', 'Beanibazar'], ['বিশ্বনাথ', 'Bishwanath'], ['কোম্পানীগঞ্জ', 'Companiganj'], ['ফেঞ্চুগঞ্জ', 'Fenchuganj'], ['গোলাপগঞ্জ', 'Golapganj'], ['গোয়াইনঘাট', 'Gowainghat'], ['জৈন্তাপুর', 'Jaintiapur'], ['জকিগঞ্জ', 'Zakiganj'], ['কানাইঘাট', 'Kanaighat'], ['দক্ষিণ সুরমা', 'Dakshin Surma'], ['ওসমানী নগর', 'Osmani Nagar']]))
    .concat(U(28, [['মুন্সিগঞ্জ সদর', 'Munshiganj Sadar'], ['শ্রীনগর', 'Sreenagar'], ['সিরাজদিখান', 'Sirajdikhan'], ['লৌহজং', 'Lohajang'], ['গজারিয়া', 'Gazaria'], ['টংগিবাড়ী', 'Tongibari']]))
    .concat(U(29, [['নরসিংদী সদর', 'Narsingdi Sadar'], ['পলাশ', 'Palash'], ['শিবপুর', 'Shibpur'], ['মনোহরদী', 'Monohardi'], ['বেলাবো', 'Belabo'], ['রায়পুরা', 'Raipura']]))
    .concat(U(30, [['কিশোরগঞ্জ সদর', 'Kishoreganj Sadar'], ['ভৈরব', 'Bhairab'], ['বাজিতপুর', 'Bajitpur'], ['করিমগঞ্জ', 'Karimganj'], ['কটিয়াদী', 'Katiadi'], ['হোসেনপুর', 'Hossainpur'], ['পাকুন্দিয়া', 'Pakundia'], ['কুলিয়ারচর', 'Kuliarchar'], ['মিঠামইন', 'Mithamain'], ['অষ্টগ্রাম', 'Austagram'], ['ইটনা', 'Itna'], ['নিকলী', 'Nikli'], ['তাড়াইল', 'Tarail']]))
    .concat(U(31, [['ফরিদপুর সদর', 'Faridpur Sadar'], ['আলফাডাঙ্গা', 'Alfadanga'], ['বোয়ালমারী', 'Boalmari'], ['চরভদ্রাসন', 'Charbhadrasan'], ['মধুখালী', 'Madhukhali'], ['নগরকান্দা', 'Nagarkanda'], ['সদরপুর', 'Sadarpur'], ['সালথা', 'Saltha'], ['ভাঙ্গা', 'Bhanga']]))
    .concat(U(32, [['গোপালগঞ্জ সদর', 'Gopalganj Sadar'], ['কাশিয়ানী', 'Kashiani'], ['কোটালীপাড়া', 'Kotalipara'], ['মুকসুদপুর', 'Muksudpur'], ['টুঙ্গিপাড়া', 'Tungipara']]))
    .concat(U(33, [['মাদারীপুর সদর', 'Madaripur Sadar'], ['কালকিনি', 'Kalkini'], ['রাজৈর', 'Rajoir'], ['শিবচর', 'Shibchar'], ['ডাসার', 'Dasar']]))
    .concat(U(34, [['রাজবাড়ী সদর', 'Rajbari Sadar'], ['গোয়ালন্দ', 'Goalanda'], ['পাংশা', 'Pangsha'], ['বালিয়াকান্দি', 'Baliakandi'], ['কালুখালী', 'Kalukhali']]))
    .concat(U(35, [['শরীয়তপুর সদর', 'Shariatpur Sadar'], ['নড়িয়া', 'Naria'], ['জাজিরা', 'Zajira'], ['গোসাইরহাট', 'Gosairhat'], ['ভেদরগঞ্জ', 'Bhedarganj'], ['ডামুড্যা', 'Damudya']]))
    .concat(U(36, [['কক্সবাজার সদর', "Cox's Bazar Sadar"], ['চকরিয়া', 'Chakaria'], ['কুতুবদিয়া', 'Kutubdia'], ['উখিয়া', 'Ukhia'], ['টেকনাফ', 'Teknaf'], ['মহেশখালী', 'Maheshkhali'], ['পেকুয়া', 'Pekua'], ['রামু', 'Ramu'], ['ঈদগাঁও', 'Eidgaon']]))
    .concat(U(37, [['ফেনী সদর', 'Feni Sadar'], ['ছাগলনাইয়া', 'Chhagalnaiya'], ['দাগনভূঞা', 'Daganbhuiyan'], ['পরশুরাম', 'Parshuram'], ['ফুলগাজী', 'Fulgazi'], ['সোনাগাজী', 'Sonagazi']]))
    .concat(U(38, [['লক্ষ্মীপুর সদর', 'Lakshmipur Sadar'], ['রায়পুর', 'Raipur'], ['রামগঞ্জ', 'Ramganj'], ['রামগতি', 'Ramgati'], ['কমলনগর', 'Kamalnagar']]))
    .concat(U(39, [['নোয়াখালী সদর', 'Noakhali Sadar'], ['বেগমগঞ্জ', 'Begumganj'], ['চাটখিল', 'Chatkhil'], ['কোম্পানীগঞ্জ', 'Companiganj'], ['হাতিয়া', 'Hatiya'], ['সেনবাগ', 'Senbagh'], ['সুবর্ণচর', 'Subarnachar'], ['কবিরহাট', 'Kabirhat'], ['সোনাইমুড়ি', 'Sonaimuri']]))
    .concat(U(40, [['ব্রাহ্মণবাড়িয়া সদর', 'Brahmanbaria Sadar'], ['আশুগঞ্জ', 'Ashuganj'], ['নাসিরনগর', 'Nasirnagar'], ['নবীনগর', 'Nabinagar'], ['বাঞ্ছারামপুর', 'Bancharampur'], ['সরাইল', 'Sarail'], ['কসবা', 'Kasba'], ['আখাউড়া', 'Akhaura'], ['বিজয়নগর', 'Bijoynagar']]))
    .concat(U(41, [['খাগড়াছড়ি সদর', 'Khagrachhari Sadar'], ['দিঘীনালা', 'Dighinala'], ['পানছড়ি', 'Panchhari'], ['লক্ষীছড়ি', 'Lakshmichhari'], ['মহালছড়ি', 'Mahalchhari'], ['মানিকছড়ি', 'Manikchhari'], ['রামগড়', 'Ramgarh'], ['মাটিরাঙ্গা', 'Matiranga'], ['গুইমারা', 'Guimara']]))
    .concat(U(42, [['রাঙ্গামাটি সদর', 'Rangamati Sadar'], ['কাপ্তাই', 'Kaptai'], ['কাউখালী', 'Kawkhali'], ['বাঘাইছড়ি', 'Baghaichhari'], ['বরকল', 'Barkal'], ['লংগদু', 'Langadu'], ['রাজস্থলী', 'Rajasthali'], ['বিলাইছড়ি', 'Belaichhari'], ['জুরাছড়ি', 'Juraichhari'], ['নানিয়ারচর', 'Naniarchar']]))
    .concat(U(43, [['বান্দরবান সদর', 'Bandarban Sadar'], ['থানচি', 'Thanchi'], ['লামা', 'Lama'], ['নাইক্ষ্যংছড়ি', 'Naikhongchhari'], ['আলীকদম', 'Alikadam'], ['রোয়াংছড়ি', 'Rowangchhari'], ['রুমা', 'Ruma']]))
    .concat(U(44, [['বাগেরহাট সদর', 'Bagerhat Sadar'], ['ফকিরহাট', 'Fakirhat'], ['মোড়েলগঞ্জ', 'Morrelganj'], ['মোংলা', 'Mongla'], ['চিতলমারী', 'Chitalmari'], ['রামপাল', 'Rampal'], ['কচুয়া', 'Kachua'], ['মোল্লাহাট', 'Mollahat'], ['শরণখোলা', 'Sarankhola']]))
    .concat(U(45, [['সাতক্ষীরা সদর', 'Satkhira Sadar'], ['আশাশুনি', 'Assasuni'], ['দেবহাটা', 'Debhata'], ['কলারোয়া', 'Kalaroa'], ['তালা', 'Tala'], ['শ্যামনগর', 'Shyamnagar'], ['কালিগঞ্জ', 'Kaliganj']]))
    .concat(U(46, [['ঝিনাইদহ সদর', 'Jhenaidah Sadar'], ['শৈলকুপা', 'Shailkupa'], ['হরিণাকুন্ডু', 'Harinakunda'], ['কালীগঞ্জ', 'Kaliganj'], ['কোটচাঁদপুর', 'Kotchandpur'], ['মহেশপুর', 'Maheshpur']]))
    .concat(U(47, [['মাগুরা সদর', 'Magura Sadar'], ['শালিখা', 'Sreepur'], ['মহম্মদপুর', 'Mohammadpur'], ['শ্রীপুর', 'Shalikha']]))
    .concat(U(48, [['নড়াইল সদর', 'Narail Sadar'], ['লোহাগড়া', 'Lohagara'], ['কালিয়া', 'Kalia']]))
    .concat(U(49, [['কুষ্টিয়া সদর', 'Kushtia Sadar'], ['কুমারখালী', 'Kumarkhali'], ['খোকসা', 'Khoksa'], ['মিরপুর', 'Mirpur'], ['ভেড়ামারা', 'Bheramara'], ['দৌলতপুর', 'Daulatpur']]))
    .concat(U(50, [['চুয়াডাঙ্গা সদর', 'Chuadanga Sadar'], ['আলমডাঙ্গা', 'Alamdanga'], ['দামুড়হুদা', 'Damurhuda'], ['জীবননগর', 'Jibannagar']]))
    .concat(U(51, [['মেহেরপুর সদর', 'Meherpur Sadar'], ['মুজিবনগর', 'Mujibnagar'], ['গাংনী', 'Gangni']]))
    .concat(U(52, [['ভোলা সদর', 'Bhola Sadar'], ['বোরহানউদ্দিন', 'Borhanuddin'], ['চরফ্যাশন', 'Char Fasson'], ['দৌলতখান', 'Daulatkhan'], ['লালমোহন', 'Lalmohan'], ['মনপুরা', 'Manpura'], ['তজুমদ্দিন', 'Tazumuddin']]))
    .concat(U(53, [['পটুয়াখালী সদর', 'Patuakhali Sadar'], ['বাউফল', 'Bauphal'], ['দশমিনা', 'Dashmina'], ['গলাচিপা', 'Galachipa'], ['কলাপাড়া', 'Kalapara'], ['মির্জাগঞ্জ', 'Mirzaganj'], ['দুমকি', 'Dumki'], ['রাঙ্গাবালী', 'Rangabali']]))
    .concat(U(54, [['পিরোজপুর সদর', 'Pirojpur Sadar'], ['নাজিরপুর', 'Nazirpur'], ['কাউখালী', 'Kawkhali'], ['জিয়ানগর', 'Zianagar'], ['ভান্ডারিয়া', 'Bhandaria'], ['মঠবাড়িয়া', 'Mathbaria'], ['নেছারাবাদ', 'Nesarabad']]))
    .concat(U(55, [['ঝালকাঠি সদর', 'Jhalokati Sadar'], ['কাঠালিয়া', 'Kathalia'], ['নলছিটি', 'Nalchity'], ['রাজাপুর', 'Rajapur']]))
    .concat(U(56, [['বরগুনা সদর', 'Barguna Sadar'], ['আমতলী', 'Amtali'], ['বামনা', 'Bamna'], ['বেতাগী', 'Betagi'], ['পাথরঘাটা', 'Patharghata'], ['তালতলী', 'Taltali']]))
    .concat(U(57, [['মৌলভীবাজার সদর', 'Moulvibazar Sadar'], ['বড়লেখা', 'Barlekha'], ['কমলগঞ্জ', 'Kamalganj'], ['কুলাউড়া', 'Kulaura'], ['রাজনগর', 'Rajnagar'], ['শ্রীমঙ্গল', 'Sreemangal'], ['জুড়ী', 'Juri']]))
    .concat(U(58, [['হবিগঞ্জ সদর', 'Habiganj Sadar'], ['বাহুবল', 'Bahubal'], ['আজমিরীগঞ্জ', 'Ajmiriganj'], ['বানিয়াচং', 'Baniachong'], ['লাখাই', 'Lakhai'], ['চুনারুঘাট', 'Chunarughat'], ['মাধবপুর', 'Madhabpur'], ['নবীগঞ্জ', 'Nabiganj'], ['শায়েস্তাগঞ্জ', 'Shayestaganj']]))
    .concat(U(59, [['সুনামগঞ্জ সদর', 'Sunamganj Sadar'], ['ছাতক', 'Chhatak'], ['দিরাই', 'Dirai'], ['ধর্মপাশা', 'Dharmapasha'], ['দোয়ারাবাজার', 'Dowarabazar'], ['জগন্নাথপুর', 'Jagannathpur'], ['জামালগঞ্জ', 'Jamalganj'], ['শাল্লা', 'Sullah'], ['তাহিরপুর', 'Tahirpur'], ['দক্ষিণ সুনামগঞ্জ', 'Dakshin Sunamganj'], ['মধ্যনগর', 'Madhyanagar']]))
    .concat(U(60, [['গাইবান্ধা সদর', 'Gaibandha Sadar'], ['সাদুল্লাপুর', 'Sadullapur'], ['পলাশবাড়ী', 'Palashbari'], ['সাঘাটা', 'Saghata'], ['গোবিন্দগঞ্জ', 'Gobindaganj'], ['সুন্দরগঞ্জ', 'Sundarganj'], ['ফুলছড়ি', 'Phulchhari']]))
    .concat(U(61, [['নীলফামারী সদর', 'Nilphamari Sadar'], ['সৈয়দপুর', 'Saidpur'], ['জলঢাকা', 'Jaldhaka'], ['কিশোরগঞ্জ', 'Kishoreganj'], ['ডোমার', 'Domar'], ['ডিমলা', 'Dimla']]))
    .concat(U(62, [['লালমনিরহাট সদর', 'Lalmonirhat Sadar'], ['আদিতমারী', 'Aditmari'], ['কালীগঞ্জ', 'Kaliganj'], ['হাতীবান্ধা', 'Hatibandha'], ['পাটগ্রাম', 'Patgram']]))
    .concat(U(63, [['ঠাকুরগাঁও সদর', 'Thakurgaon Sadar'], ['পীরগঞ্জ', 'Pirganj'], ['রাণীশংকৈল', 'Ranisankail'], ['হরিপুর', 'Haripur'], ['বালিয়াডাঙ্গী', 'Baliadangi']]))
    .concat(U(64, [['পঞ্চগড় সদর', 'Panchagarh Sadar'], ['বোদা', 'Boda'], ['দেবীগঞ্জ', 'Debiganj'], ['তেতুলিয়া', 'Tetulia'], ['আটোয়ারী', 'Atwari']]));

  function fold(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/উপজেলা|থানা|পৌরসভা|জেলা|বিভাগ/g, '')
      .replace(/division|district|zila|zilla|upazila|upozila|thana|pourashava|paurashava|municipality|union/g, '')
      .replace(/chittagong/g, 'chattogram')
      .replace(/comilla/g, 'cumilla')
      .replace(/jessore/g, 'jashore')
      .replace(/bogra|bogura/g, 'bogura')
      .replace(/barisal/g, 'barishal')
      .replace(/[\s\-_.',]/g, '');
  }

  function nameTokens(raw) {
    return String(raw || '')
      .split(/[,/|()]+/)
      .map((p) => p.trim())
      .filter((p) => p.length >= 3);
  }

  const UPAZILA_COORDS = {
    Savar: [23.858, 90.257], Dhamrai: [23.908, 90.170], Keraniganj: [23.678, 90.330],
    Nawabganj: [23.670, 90.150], Dohar: [23.596, 90.125], Tejgaon: [23.759, 90.391],
    Sutrapur: [23.706, 90.415], Kotwali: [23.710, 90.408], Lalbagh: [23.719, 90.388],
    Chawkbazar: [23.717, 90.396], Bangshal: [23.718, 90.405], Gendaria: [23.700, 90.426],
    Wari: [23.714, 90.419], Motijheel: [23.729, 90.417], Ramna: [23.738, 90.401],
    Shahbagh: [23.738, 90.395], Dhanmondi: [23.746, 90.374], Mohammadpur: [23.765, 90.358],
    Gulshan: [23.792, 90.414], Mirpur: [23.804, 90.365], Uttara: [23.875, 90.379],
    Jatrabari: [23.710, 90.435], Demra: [23.723, 90.492], Kamrangirchar: [23.715, 90.363],
    Cantonment: [23.822, 90.408],
  };

  const CITY_NEIGHBORHOOD_ALIASES = {
    islampur: 'Sutrapur',
    shakharibazar: 'Sutrapur',
    shankharibazar: 'Sutrapur',
    sakhari: 'Sutrapur',
    jagannathuniversity: 'Sutrapur',
    jagannath: 'Sutrapur',
    olddhaka: 'Sutrapur',
    purandhaka: 'Sutrapur',
    sadarghat: 'Sutrapur',
    bakshibazar: 'Lalbagh',
    azimpur: 'Lalbagh',
    chawkbazar: 'Chawkbazar',
    chakbazar: 'Chawkbazar',
    bangshal: 'Bangshal',
    gendaria: 'Gendaria',
    wari: 'Wari',
    motijheel: 'Motijheel',
    ramna: 'Ramna',
    shahbagh: 'Shahbagh',
    shahbag: 'Shahbagh',
    dhanmondi: 'Dhanmondi',
    mohammadpur: 'Mohammadpur',
    gulshan: 'Gulshan',
    banani: 'Cantonment',
    mirpur: 'Mirpur',
    uttara: 'Uttara',
    jatrabari: 'Jatrabari',
    demra: 'Demra',
    kamrangirchar: 'Kamrangirchar',
    tejgaon: 'Tejgaon',
    farmgate: 'Tejgaon',
  };

  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
  }

  /** Parse Google/OSM Bangladesh address parts (Division / District / Upazila). */
  function parseBangladeshAdmin(names) {
    if (!names) return { division: null, district: null, upazila: null };
    const texts = []
      .concat(names.display ? [names.display] : [])
      .concat(names.candidates || [])
      .concat([names.division, names.district, names.upazila].filter(Boolean));

    let division = null;
    let district = null;
    let upazila = null;

    texts.forEach((raw) => {
      String(raw).split(/[,|]+/).forEach((part) => {
        const p = part.trim();
        if (!p) return;
        const divM = p.match(/^(.+?)\s+Division$/i);
        const distM = p.match(/^(.+?)\s+District$/i);
        const upaM = p.match(/^(.+?)\s+(?:Upazila|Thana)$/i);
        if (divM) division = division || (divM[1].trim() + ' Division');
        if (distM) district = district || (distM[1].trim() + ' District');
        if (upaM) upazila = upazila || (upaM[1].trim() + ' Upazila');
      });
    });

    const rawDist = names.district;
    const rawUpa = names.upazila;
    if (rawDist && /upazila|thana|উপজেলা|থানা/i.test(String(rawDist))) {
      upazila = upazila || rawDist;
    } else if (rawDist && !district) {
      district = rawDist;
    }
    if (rawUpa && /upazila|thana|উপজেলা|থানা/i.test(String(rawUpa))) {
      upazila = upazila || rawUpa;
    }
    if (!division && names.division) division = names.division;

    return { division, district, upazila };
  }

  const Geo = {
    divisions: () => divisions.slice(),
    districts: (divisionId) => districts.filter((d) => String(d.division_id) === String(divisionId)),
    upazilas: (districtId) => upazilas.filter((u) => String(u.district_id) === String(districtId)),
    allDistricts: () => districts,
    findDivision: (id) => divisions.find((d) => String(d.id) === String(id)),
    findDistrict: (id) => districts.find((d) => String(d.id) === String(id)),
    findUpazila: (id) => upazilas.find((u) => String(u.id) === String(id)),

    matchName(list, raw) {
      const f = fold(raw);
      if (!f || f.length < 3) return null;
      const exact = list.find((x) => fold(x.name_en) === f || fold(x.name_bn) === f);
      if (exact) return exact;
      const withoutSadar = f.replace(/সদর|sadar/g, '');
      if (withoutSadar.length >= 4) {
        const sadarHit = list.find((x) => fold(x.name_en) === withoutSadar + 'sadar' || fold(x.name_bn) === withoutSadar + 'সদর');
        if (sadarHit) return sadarHit;
      }
      if (f.length < 5) return null;
      return list.find((x) => {
        const en = fold(x.name_en);
        const bn = fold(x.name_bn);
        return (en.length >= 5 && (en.includes(f) || f.includes(en)))
          || (bn.length >= 5 && (bn.includes(f) || f.includes(bn)));
      }) || null;
    },

    matchUpazila(raw, districtId) {
      const list = districtId ? this.upazilas(districtId) : upazilas;
      return this.matchName(list, raw);
    },

    resolveAliasUpazila(districtId, names) {
      const list = this.upazilas(districtId);
      if (!list.length || !names) return null;
      const bag = []
        .concat(names.upazila || [])
        .concat(names.candidates || [])
        .concat(names.display ? String(names.display).split(/[,|]+/) : []);
      for (let i = 0; i < bag.length; i++) {
        const key = fold(bag[i]);
        const alias = CITY_NEIGHBORHOOD_ALIASES[key];
        if (!alias) continue;
        const hit = this.matchName(list, alias);
        if (hit) return hit;
      }
      return null;
    },

    nearestUpazilaInDistrict(districtId, lat, lon) {
      const list = this.upazilas(districtId);
      let best = null;
      let bestD = Infinity;
      list.forEach((u) => {
        const xy = UPAZILA_COORDS[u.name_en];
        if (!xy) return;
        const dist = haversine(lat, lon, xy[0], xy[1]);
        if (dist < bestD) { bestD = dist; best = u; }
      });
      return bestD <= 12 ? best : null;
    },

    findUpazilaInDistrict(districtId, names, parsed) {
      if (!districtId || !names) return null;
      const list = this.upazilas(districtId);
      if (!list.length) return null;

      const aliasHit = this.resolveAliasUpazila(districtId, names);
      if (aliasHit) return aliasHit;

      if (parsed && parsed.upazila) {
        const hit = this.matchName(list, parsed.upazila);
        if (hit) return hit;
      }

      const raw = names.upazila;
      if (raw && /upazila|thana|উপজেলা|থানা/i.test(String(raw))) {
        const hit = this.matchName(list, raw);
        if (hit) return hit;
      }

      const candidates = names.candidates || [];
      for (let i = 0; i < candidates.length; i++) {
        const c = String(candidates[i]);
        if (!/upazila|thana|উপজেলা|থানা/i.test(c)) continue;
        const hit = this.matchName(list, c);
        if (hit) return hit;
      }

      return null;
    },

    resolveDistrictFromCoords(lat, lon, enriched, parsed) {
      let district = null;
      let division = null;

      if (enriched) {
        if (parsed && parsed.district) {
          district = this.matchName(districts, parsed.district);
        }
        if (!district && enriched.district && !/upazila|thana|উপজেলা|থানা/i.test(String(enriched.district))) {
          district = this.matchName(districts, enriched.district);
        }
        if (!district && enriched.division) {
          const div = this.matchName(divisions, enriched.division);
          if (div) {
            division = div;
            if (parsed && parsed.district) {
              district = this.matchName(this.districts(div.id), parsed.district);
            }
          }
        }
        if (district && !division) division = this.findDivision(district.division_id);
      }

      const nearest = this.nearestDistrict(lat, lon);
      if (!district) {
        return { district: nearest, division: this.findDivision(nearest.division_id) };
      }

      const distToNamed = haversine(lat, lon, district.lat, district.lon);
      const distToNearest = haversine(lat, lon, nearest.lat, nearest.lon);
      if (distToNamed > 80 && distToNearest < distToNamed - 20) {
        return { district: nearest, division: this.findDivision(nearest.division_id) };
      }

      return { district, division };
    },

    nearestDistrict(lat, lon) {
      let best = districts[0];
      let bestD = Infinity;
      districts.forEach((d) => {
        const dist = haversine(lat, lon, d.lat, d.lon);
        if (dist < bestD) { bestD = dist; best = d; }
      });
      return best;
    },

    resolveFromNames(divisionName, districtName, upazilaName, extraNames) {
      const payload = extraNames && typeof extraNames === 'object'
        ? extraNames
        : { division: divisionName, district: districtName, upazila: upazilaName };
      const parsed = parseBangladeshAdmin(payload);

      let district = this.matchName(districts, parsed.district || districtName || payload.district);
      let division = null;
      if (!district && (divisionName || payload.division)) {
        const div = this.matchName(divisions, divisionName || payload.division);
        if (div) {
          division = div;
          district = this.matchName(this.districts(div.id), parsed.district || districtName || payload.district);
        }
      }
      if (!district) return null;
      if (!division) division = this.findDivision(district.division_id);

      const upazila = this.findUpazilaInDistrict(district.id, payload, parsed)
        || this.matchName(this.upazilas(district.id), parsed.upazila || upazilaName || payload.upazila);

      return { division, district, upazila: upazila || null };
    },

    resolveFromCoords(lat, lon, names) {
      const parsed = names ? parseBangladeshAdmin(names) : null;
      const enriched = names ? {
        ...names,
        division: (parsed && parsed.division) || names.division,
        district: (parsed && parsed.district) || names.district,
        upazila: (parsed && parsed.upazila) || names.upazila,
      } : null;

      const { district, division } = this.resolveDistrictFromCoords(lat, lon, enriched, parsed);
      const upazila = (enriched ? this.findUpazilaInDistrict(district.id, enriched, parsed) : null)
        || this.nearestUpazilaInDistrict(district.id, lat, lon);

      return { division, district, upazila };
    },
  };

  global.FolikaGeo = Geo;
})(window);
