import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const referenceRoot = path.resolve(projectRoot, "..");
const outputPath = path.join(projectRoot, "lib", "event-public-details.json");

const sources = {
  "event-001": "03_學歷成績與學術證明/03-01_臺北市金華國小求學歷程",
  "event-002": "03_學歷成績與學術證明/03-02_臺北市中正國中求學歷程",
  "event-003": "03_學歷成績與學術證明/03-03_建國中學第37屆數理資優班_2019-2022",
  "event-004": "03_學歷成績與學術證明/03-04_國立臺灣大學入學與求學歷程_2022-2027",
  "event-005": "03_學歷成績與學術證明/03-05_臺大機械工程學習歷程",
  "event-006": "03_學歷成績與學術證明/03-06_臺大土木工程學習歷程",
  "event-007": "03_學歷成績與學術證明/03-07_臺大數學輔系歷程",
  "event-008": "03_學歷成績與學術證明/03-08_臺大書卷獎與成績優良",
  "event-011": "04_研究經歷與學術成果/04-01_加入臺大仿生機器人實驗室_BioRoLa_2025至今",
  "event-015": "04_研究經歷與學術成果/04-05_工程數學1600頁以上筆記與個人知識系統",
  "event-021": "06_競賽教學服務領導與個人活動/06-01_競賽與獎項/01_01_建中數學能力競賽_高一二等獎與三年連續獲獎",
  "event-022": "06_競賽教學服務領導與個人活動/06-01_競賽與獎項/02_02_APMOC選訓與APMO-TMO資格歷程_2019-2022",
  "event-023": "06_競賽教學服務領導與個人活動/06-01_競賽與獎項/03_03_TRML連續兩年隊長_2020銅牌_2021銀牌",
  "event-024": "06_競賽教學服務領導與個人活動/06-01_競賽與獎項/04_04_幾何覆蓋數學研究_科展優等獎",
  "event-025": "06_競賽教學服務領導與個人活動/06-01_競賽與獎項/05_05_建國中學合唱比賽_最佳獨唱",
  "event-026": "06_競賽教學服務領導與個人活動/06-02_教學與科學推廣/01_01_臺大數學與力學期末複習活動_同儕教學",
  "event-027": "06_競賽教學服務領導與個人活動/06-02_教學與科學推廣/02_02_建中科學研習社_數學教學",
  "event-028": "06_競賽教學服務領導與個人活動/06-02_教學與科學推廣/03_03_臺中清水國中_科研下鄉科學營",
  "event-029": "06_競賽教學服務領導與個人活動/06-02_教學與科學推廣/04_04_宜蘭中山國小_數資班服務科學營",
  "event-030": "06_競賽教學服務領導與個人活動/06-02_教學與科學推廣/05_05_臺北仁愛國中_數資班服務科學營",
  "event-031": "06_競賽教學服務領導與個人活動/06-02_教學與科學推廣/06_06_溝子口錫安堂_國小至高中課後輔導",
  "event-032": "06_競賽教學服務領導與個人活動/06-03_志工與跨文化支持/01_01_臺大機械系鐵馬週_免費腳踏車維修志工",
  "event-033": "06_競賽教學服務領導與個人活動/06-03_志工與跨文化支持/02_02_臺大國際生志工_緬甸新生簽證與文件驗證協助",
  "event-034": "06_競賽教學服務領導與個人活動/06-03_志工與跨文化支持/03_03_國際新生抵臺後_選課住宿與校園適應協助",
  "event-036": "06_競賽教學服務領導與個人活動/06-04_領導與校園活動/01_01_建中數資班海外旅行_總召",
  "event-037": "06_競賽教學服務領導與個人活動/06-04_領導與校園活動/02_02_建中數資班獨立研究成果發表會_總召",
  "event-038": "06_競賽教學服務領導與個人活動/06-04_領導與校園活動/03_03_臺大土木營_隊輔",
  "event-039": "06_競賽教學服務領導與個人活動/06-04_領導與校園活動/04_04_臺大機械宿營_工作人員",
  "event-040": "06_競賽教學服務領導與個人活動/06-04_領導與校園活動/05_05_臺大建北週_工作人員",
  "event-042": "06_競賽教學服務領導與個人活動/06-05_運動音樂與個人興趣/01_01_臺大機械系棒球隊_球隊訓練與比賽",
  "event-043": "06_競賽教學服務領導與個人活動/06-05_運動音樂與個人興趣/02_02_臺大土木之夜_主唱與舞台演出",
  "event-045": "06_競賽教學服務領導與個人活動/06-05_運動音樂與個人興趣/03_03_棒球球迷歷程_Team_Taiwan_中信兄弟_紐約洋基",
  "event-047": "08_作品連結與網站參考/08-02_GitHub社群帳號與公開專案/01_GitHub工程與研究專案公開紀錄",
  "event-048": "06_競賽教學服務領導與個人活動/06-01_競賽與獎項/06_06_2019-2020_榕數盃數學競賽_連續兩屆佳作",
  "event-049": "06_競賽教學服務領導與個人活動/06-01_競賽與獎項/07_07_2020資優數學研習營_Gifted_Math_Camp",
  "event-050": "06_競賽教學服務領導與個人活動/06-01_競賽與獎項/08_08_2020_AMC10A_97.5分_PR92_Excellent",
  "event-051": "06_競賽教學服務領導與個人活動/06-01_競賽與獎項/09_09_2021_APX全國高中數理能力檢定_中高級銅牌與高級合格",
  "event-052": "06_競賽教學服務領導與個人活動/06-01_競賽與獎項/10_10_國中TMT8數理能力檢定_傑出",
  "event-053": "06_競賽教學服務領導與個人活動/06-01_競賽與獎項/11_11_國中全國數學奧林匹克競賽_三等獎",
  "event-054": "06_競賽教學服務領導與個人活動/06-01_競賽與獎項/12_12_國中JHMC數學競賽_團體與個人優良獎",
  "event-055": "06_競賽教學服務領導與個人活動/06-01_競賽與獎項/13_13_2016_MathLeague七年級_Honor_Roll_of_Distinction_全球前6",
  "event-056": "06_競賽教學服務領導與個人活動/06-01_競賽與獎項/14_14_2016第3屆超越盃_TAMC7_全球前12百分比",
};

// Eight events were added to the canonical 60-event registry after the original
// per-event folder structure was created. Their visitor-facing facts are already
// present in the paired bilingual page manuscripts below. Keep the curated detail
// text here, next to assertions against those authoritative manuscripts, so the
// generated site never falls back to an empty detail page or accidentally exposes
// the editorial/governance sections that surround the public copy.
const aggregateSources = {
  "event-009": {
    assertions: {
      zh: [{
        file: "03_學歷成績與學術證明/03-09_臺大GPA成績單與A+課程/廖致翔_完整學業成績彙整_截至114-2.md",
        includes: [
          "Mechanical Engineering Major GPA = (317.0 + 97.7) ÷ (76 + 23) = 414.7 ÷ 99 = 4.1889",
          "Mechanical Engineering Major GPA（建議預設） | 41 | 99",
          "機械系定必修 GPA | 30 | 70",
          "4.00制的Overall與Major GPA皆為自行重算值，不是臺大成績單上的官方GPA",
        ],
      }],
      en: [{
        file: "03_學歷成績與學術證明/03-09_臺大GPA成績單與A+課程/廖致翔_完整學業成績彙整_截至114-2.md",
        includes: [
          "Overall GPA | 67 | 156",
          "Mechanical Engineering Major GPA（建議預設） | 41 | 99",
          "Engineering／STEM Technical GPA | 55 | 130",
        ],
      }],
    },
    markdown: {
      en: `### Mechanical Engineering major results

Calculated from course-level grades and actual credit weights, my **Mechanical Engineering Major GPA is 4.19 / 4.30**; using the documented course-by-course conversion below, the same course set is **3.96 / 4.00**. This definition covers 41 graded records and 99 graded credits: all letter-graded ME-coded courses together with the mathematics, physics, chemistry, and programming foundations required for the major.

My **Required Mechanical Engineering Coursework GPA is 4.21 / 4.30**, or **3.98 / 4.00** after course-by-course conversion, across 30 graded records and 70 graded credits. It reflects performance in the prescribed curriculum and is listed separately from the broader major-GPA calculation.

### GPA definitions and calculations

| GPA definition | Graded records / credits | 4.30 scale | 4.00 course-by-course conversion | Courses included |
| --- | --- | --- | --- | --- |
| Overall cumulative GPA | 67 / 156 | **4.13 / 4.30** | **3.92 / 4.00** | All graded courses across eight semesters |
| Mechanical Engineering Major GPA | 41 / 99 | **4.19 / 4.30** | **3.96 / 4.00** | Letter-graded ME courses plus the mathematics, physics, chemistry, and programming foundations for the major |
| Mechanical / robotics relevant technical coursework | 50 / 120 | **4.19 / 4.30** | **3.95 / 4.00** | Broader technical coursework related to mechanics and robotics |
| ME-prefix GPA | 30 / 76 | **4.17 / 4.30** | **3.95 / 4.00** | Letter-graded ME-coded courses only |
| Engineering / STEM Technical GPA | 55 / 130 | **4.17 / 4.30** | **3.95 / 4.00** | Letter-graded ME, CIE, MATH, Phys, Chem, IE, and CSIE courses |
| Required Mechanical Engineering Coursework GPA | 30 / 70 | **4.21 / 4.30** | **3.98 / 4.00** | Prescribed Mechanical Engineering curriculum completed for letter grades |
| Mechanical Engineering Major GPA excluding undergraduate research | 39 / 95 | **4.20 / 4.30** | **3.96 / 4.00** | Mechanical Engineering major course set excluding undergraduate research |

### Strength across the full record

Across eight semesters, I completed 163 earned credits, of which 156 carry letter grades. **110 of 156 graded credits (70.5%) earned A+**, while 138 graded credits earned A or above. Three foundations central to my current work—calculus and engineering mathematics; core mechanics and dynamics; and programming, linear algebra, and numerical methods—comprise **20 graded records and 50 credits, all at A+ (4.30 / 4.30)**. The record also includes the NTU Academic Excellence Award, seven consecutive semester GPAs above 4.00 / 4.30, and no failing grades.

### Calculation method and references

The major-GPA course set is informed by published university definitions. [UC Berkeley Mechanical Engineering's MEng admissions page](https://me.berkeley.edu/graduate/meng-admissions/) includes mathematics and physics in technical major coursework, while [Claremont McKenna College Registrar guidance](https://www.cmc.edu/registrar/calculating-major-gpa/) states that two majors should be calculated separately. The 4.00-scale figures use [UC Berkeley Mechanical Engineering's international GPA conversion table](https://me.berkeley.edu/wp-content/uploads/2019/01/International-GPA-Conversion.pdf): A+ and A map to 4.0, A− to 3.7, B+ to 3.3, and so on, with each course weighted by its actual credits. The values are not produced by linearly scaling 4.30 to 4.00.

All figures are reproducible calculations from course-level grades and credits rather than official NTU transcript GPA fields. The referenced university materials provide methodological definitions and do not constitute an endorsement. The official transcript and each institution's own academic policies remain authoritative.`,
      zh: `### 機械工程主修成績

依單科成績與實際學分計算，我的 **機械工程主修 GPA 為 4.19／4.30**；依下方所列方式逐科換算為 **3.96／4.00**。此範圍涵蓋 41 筆計分紀錄、99 個計分學分，包括所有具字母成績的 ME 課號課程，以及機械工程主修所需的數學、物理、化學與程式設計基礎課程。

機械系定必修 GPA 為 **4.21／4.30**，逐科換算為 **3.98／4.00**，涵蓋 30 筆計分紀錄、70 個計分學分。此數值反映系定必修課程表現，與範圍較廣的機械工程主修 GPA 分列。

### GPA 採計範圍與換算結果

| GPA 採計範圍 | 計分紀錄／學分 | 4.30 制 | 4.00 制逐科換算 | 採計說明 |
| --- | --- | --- | --- | --- |
| 整體累計 GPA | 67／156 | **4.13／4.30** | **3.92／4.00** | 全部計分課程的學分加權平均 |
| 機械工程主修 GPA | 41／99 | **4.19／4.30** | **3.96／4.00** | 機械工程系課程與主修所需的數學、物理、化學及程式設計基礎課程 |
| 機械／機器人相關技術課程 GPA | 50／120 | **4.19／4.30** | **3.95／4.00** | 機械與機器人方向的相關技術課程 |
| ME 課號 GPA | 30／76 | **4.17／4.30** | **3.95／4.00** | 僅計入 ME 課號課程 |
| 工程與 STEM 技術課程 GPA | 55／130 | **4.17／4.30** | **3.95／4.00** | ME、CIE、MATH、Phys、Chem、IE 與 CSIE 的計分課程 |
| 機械系定必修 GPA | 30／70 | **4.21／4.30** | **3.98／4.00** | 機械系定必修課程 |
| 排除學士專題研究的機械工程主修 GPA | 39／95 | **4.20／4.30** | **3.96／4.00** | 主修課程中不計學士專題研究 |

### 完整學業紀錄中的優勢

八個學期共完成 163 個實得學分，其中 156 個學分採字母成績計分。**156 個計分學分中有 110 學分取得 A+，占 70.5%**，另有 138 個學分取得 A 以上。與目前研究方向密切相關的三項主幹——微積分與工程數學、核心力學與動力學，以及程式設計、線性代數與數值方法——合計 **20 筆計分紀錄、50 學分全數 A+（4.30／4.30）**。學業紀錄另包含臺大書卷獎、連續七學期的學期 GPA 均高於 4.00／4.30，且沒有不及格紀錄。

### 計算方法與參考依據

主修 GPA 的課程範圍參考校方公開定義：[UC Berkeley Mechanical Engineering 的 MEng 申請頁](https://me.berkeley.edu/graduate/meng-admissions/)將數學與物理納入 technical major coursework；[Claremont McKenna College Registrar 的 Major GPA 說明](https://www.cmc.edu/registrar/calculating-major-gpa/)則說明雙主修應分別計算。4.00 制數值依 [UC Berkeley Mechanical Engineering 的國際 GPA 換算表](https://me.berkeley.edu/wp-content/uploads/2019/01/International-GPA-Conversion.pdf)逐科對應：A+、A 為 4.0，A− 為 3.7，B+ 為 3.3，依此類推，再按每科實際學分加權；並非將 4.30 線性縮放為 4.00。

以上數值均依單科成績與學分重新計算，不是臺大成績單直接核發的 GPA 欄位。所引校方資料僅作為方法與定義的參考，不代表相關學校對本人成績的認可；正式成績仍以臺大成績單與各校或學程的採計規定為準。`,
    },
  },
  "event-014": {
    assertions: {
      zh: [{
        file: "09_網站頁面草稿與受眾版本/09-07_研究輸出與寫作_Writing/01_Writing與Research_Outputs頁面文案.md",
        includes: ["Curvilinear Basis-Vector Derivatives in Mathematica", "曾在臺大課堂介紹自寫程式"],
      }],
      en: [{
        file: "09_網站頁面草稿與受眾版本/09-07_研究輸出與寫作_Writing/01_Writing_Research_Outputs_Page_Copy_EN.md",
        includes: ["Curvilinear Basis-Vector Derivatives in Mathematica", "presented the program in an NTU class"],
      }],
    },
    markdown: {
      zh: `### 把推導變成可重複檢查的符號計算

曲線座標中的基底會隨位置改變，其微分是向量分析、連續體力學與張量運算的重要基礎。我將相關推導程式化，使不同座標系中的基底向量微分能被符號計算、檢查與展示，並曾在臺大課堂介紹自寫程式。

### 符號計算與課堂分享

這套程式將解析推導整理為可重複執行與檢查的計算流程，並曾於臺大課堂介紹其數學原理與實作方式。`,
      en: `### Turning a derivation into checkable symbolic computation

Basis vectors in curvilinear coordinates change with position, and their derivatives form an important foundation for vector analysis, continuum mechanics, and tensor operations. I implemented the derivation symbolically so that basis-vector derivatives in different coordinate systems could be computed, checked, and presented. I also presented the program in an NTU class.

### Symbolic computation and classroom presentation

The program turns an analytic derivation into a repeatable, checkable computation. I presented both the mathematical basis and the implementation in an NTU class.`,
    },
  },
  "event-035": {
    assertions: {
      zh: [{
        file: "09_網站頁面草稿與受眾版本/09-06_教學服務與領導_Impact/01_Impact頁面文案.md",
        includes: ["在跨文化交流中分享臺灣生活", "公開版全程匿名"],
      }],
      en: [{
        file: "09_網站頁面草稿與受眾版本/09-06_教學服務與領導_Impact/01_Leadership_Teaching_Service_Page_Copy_EN.md",
        includes: ["shared local culture in a cross-cultural support setting", "public version remains fully anonymous"],
      }],
    },
    markdown: {
      zh: `### 從協助新生，到彼此交流

國際新生抵臺後，我繼續協助選課、住宿、校園系統與生活適應，並在跨文化交流中分享臺灣生活。這段陪伴也逐漸成為生活化的跨文化友誼，讓彼此能在日常相處中理解不同文化的生活方式與溝通習慣。

### 跨文化支持中的理解與調整

這段經驗讓我更重視先理解對方的處境，再把複雜資訊拆成可採取的下一步。可靠的支持不只是一次性回答問題，也來自耐心回應、持續跟進，以及在文化差異中調整溝通方式。`,
      en: `### From formal support to mutual exchange

After the international student arrived in Taiwan, support that began with administrative and campus-adjustment questions gradually extended to everyday life, local culture, and travel. The experience was not a one-way introduction to Taiwan. It became a mutual process of learning how different cultures approach daily life, communication, and adaptation, and the volunteer relationship grew into a genuine friendship.

### Understanding and adapting across cultures

The experience taught me to understand another person's situation before breaking complex information into practical next steps. Reliable support is more than answering a question once; it depends on patient responses, consistent follow-through, and a willingness to adapt how I communicate across cultural differences.`,
    },
  },
  "event-041": {
    assertions: {
      zh: [{
        file: "09_網站頁面草稿與受眾版本/09-10_個人故事興趣與國際經驗_Personal/01_Personal長版文案_從迷惘到自洽.md",
        includes: ["日本遊學", "不同語言與文化中獨立生活"],
      }],
      en: [{
        file: "09_網站頁面草稿與受眾版本/09-10_個人故事興趣與國際經驗_Personal/01_Personal_Story_From_Uncertainty_to_Coherence_EN.md",
        includes: ["A study program in Japan", "living independently in a different language and culture"],
      }],
    },
    markdown: {
      zh: `### 在東京，把語言放進日常生活

EF 東京暑期遊學讓我同時練習日文，也體驗在陌生城市中獨立生活。我需要安排每天的交通與生活大小事，並在不同語言與文化中調整自己的理解與表達方式。

### 這段遊學帶給我的改變

日本遊學讓我第一次長時間在不同語言與文化中獨立生活，也讓我更具體地理解海外學習與生活的樣貌。這段經歷著重於獨立生活、文化與語言適應，不代表任何語言能力認證。`,
      en: `### Putting language into everyday life in Tokyo

The EF summer program in Tokyo combined Japanese-language study with independent living. I had to navigate an unfamiliar city, make practical day-to-day decisions, and adapt how I understood and expressed myself in a different linguistic and cultural setting.

### What I took from the experience

It was my first extended experience living independently in a different linguistic and cultural setting. It gave me a more practical understanding of studying abroad. This was an experience in daily adaptation and cultural learning, not evidence of formal language certification.`,
    },
  },
  "event-044": {
    assertions: {
      zh: [{
        file: "06_競賽教學服務領導與個人活動/06-05_運動音樂與個人興趣/03_03_棒球球迷歷程_Team_Taiwan_中信兄弟_紐約洋基/00_網站文案草稿.md",
        includes: ["國際賽裡的中華隊", "凝聚整個社會"],
      }, {
        file: "09_網站頁面草稿與受眾版本/03_60項事件網站路由與呈現層級.md",
        includes: ["2024 Premier12 臺灣奪冠回憶", "非個人成就"],
      }],
      en: [{
        file: "06_競賽教學服務領導與個人活動/06-05_運動音樂與個人興趣/03_03_棒球球迷歷程_Team_Taiwan_中信兄弟_紐約洋基/01_Website_Copy_EN.md",
        includes: ["Team Taiwan in international competition", "bring an entire society together"],
      }],
    },
    markdown: {
      zh: `### 與中華隊共同經歷的冠軍時刻

2024 Premier12 臺灣奪冠，是我身為球迷十分珍惜的一段集體記憶。許多人共同關注中華隊、投入比賽並分享喜悅，這也成為我長期棒球記憶中格外重要的一頁。

### 棒球如何把人連在一起

國際賽裡的中華隊讓我感受到，一項運動如何凝聚整個社會。這段回憶也連結著我長期支持中華隊、中信兄弟與紐約洋基的球迷歷程。棒球為長期密集的求學生涯留下熱血與節奏，也讓我理解團隊、逆境與「下一球」的意義。`,
      en: `### Sharing Team Taiwan's championship moment

Taiwan's 2024 Premier12 championship is a collective memory that I value deeply as a fan. It brought people together around Team Taiwan and became an especially meaningful part of my lifelong relationship with baseball.

### How baseball brings people together

Team Taiwan in international competition has shown me how one sport can bring an entire society together. This memory is part of my longstanding support for Team Taiwan, the CTBC Brothers, and the New York Yankees, and it preserves a genuine, enduring passion alongside my academic and research work.`,
    },
  },
  "event-057": {
    assertions: {
      zh: [{
        file: "09_網站頁面草稿與受眾版本/09-06_教學服務與領導_Impact/01_Impact頁面文案.md",
        includes: ["高一風紀股長", "日常團隊經驗"],
      }, {
        file: "09_網站頁面草稿與受眾版本/03_60項事件網站路由與呈現層級.md",
        includes: ["建中高一風紀股長", "日常責任、期限意識與班級服務"],
      }],
      en: [{
        file: "09_網站頁面草稿與受眾版本/09-06_教學服務與領導_Impact/01_Leadership_Teaching_Service_Page_Copy_EN.md",
        includes: ["first-year discipline officer", "everyday experience of teams"],
      }],
    },
    markdown: {
      zh: `### 從班級日常學習承擔責任

建中高一擔任風紀股長，是一項不張揚但具體的班級服務。這個職務要求我留意各項期限、按時完成固定工作，並把每天的小事穩定做好。

### 日常責任與團隊合作

這段經驗讓我理解，合作不只體現在重大決策，也包括持續完成團體日常所需的工作。穩定、準時與願意承擔，是後來參與營隊、專案與團隊合作的重要基礎。`,
      en: `### Learning reliability through everyday responsibility

Serving as discipline officer during my first year at Chien Kuo was a quiet but concrete form of class service. The role required attention to deadlines, consistent follow-through, and care for the routine tasks that sustain a shared learning environment.

### Everyday responsibility and teamwork

The experience taught me that collaboration is visible not only in major decisions, but also in consistently completing the routine work a group depends on. Reliability, punctuality, and a willingness to take responsibility became important foundations for my later work in camps, projects, and teams.`,
    },
  },
  "event-058": {
    assertions: {
      zh: [{
        file: "09_網站頁面草稿與受眾版本/09-07_研究輸出與寫作_Writing/01_Writing與Research_Outputs頁面文案.md",
        includes: ["Taylor Series｜25 分鐘線上社展教學", "25 分 18 秒影片"],
      }],
      en: [{
        file: "09_網站頁面草稿與受眾版本/09-07_研究輸出與寫作_Writing/01_Writing_Research_Outputs_Page_Copy_EN.md",
        includes: ["Taylor Series | 25-Minute Online Science Club Lesson", "25-minute-18-second lesson"],
      }],
    },
    markdown: {
      zh: `### 25 分 18 秒的泰勒展開式線上教學

高中科研社線上社展中，我以 25 分 18 秒影片完整講解泰勒展開式。這段作品讓人看見我如何把抽象公式拆成動機、近似、推導與使用情境，也記錄了我在鏡頭前進行長篇數學說明的早期訓練。

### 從會解題，到把問題說清楚

製作這支影片需要同時兼顧數學轉譯、鏡頭表達與影音製作。它的價值不只在公式本身，也在於如何重新組織概念，讓其他學生能循序理解。`,
      en: `### A 25-minute, 18-second online lesson on Taylor series

For an online high-school science club exhibition, I recorded a 25-minute, 18-second lesson explaining Taylor expansions. I decomposed the abstract formula into motivation, approximation, derivation, and use cases, creating a path that other students could follow.

### From solving a problem to sustaining an explanation

The project required clear mathematical communication, on-camera presentation, and video production. It also records an early attempt to deliver a sustained mathematical explanation on camera. Its value lies not only in the formula, but also in reorganizing the idea so that another reader or viewer can engage with the problem.`,
    },
  },
  "event-059": {
    assertions: {
      zh: [{
        file: "09_網站頁面草稿與受眾版本/09-07_研究輸出與寫作_Writing/01_Writing與Research_Outputs頁面文案.md",
        includes: ["從可數到 Cantor 對角線", "從 Euler 公式走向更遠"],
      }],
      en: [{
        file: "09_網站頁面草稿與受眾版本/09-07_研究輸出與寫作_Writing/01_Writing_Research_Outputs_Page_Copy_EN.md",
        includes: ["From Countability to Cantor’s Diagonal Argument", "Beyond Euler’s Formula"],
      }],
    },
    markdown: {
      zh: `### 集合論｜從可數到 Cantor 對角線

2021 年撰寫數學科普內容，介紹集合、對射、可數／不可數與 Cantor diagonal argument，嘗試讓抽象概念保留嚴謹，同時讓高中讀者能找到直覺入口。

### 複數與函數｜從 Euler 公式走向更遠

同系列內容由 Euler 公式延伸到複數指數與對數、Lambert W 與雙曲函數。它代表我很早就不滿足於只會算題，而想把知識的延伸關係整理成別人也能走進去的路。`,
      en: `### Set theory | From countability to Cantor's diagonal argument

In 2021, I wrote mathematics outreach pieces introducing sets, bijections, countability and uncountability, and Cantor's diagonal argument. I wanted the abstract ideas to retain their rigor while giving high-school readers an intuitive path toward notation and argument.

### Complex numbers and functions | Beyond Euler's formula

Another piece in the series begins with Euler's formula and extends to complex exponentials and logarithms, the Lambert W function, and hyperbolic functions. The series records an early desire not merely to perform calculations, but to organize relationships among ideas into a path another reader could follow.`,
    },
  },
  "event-060": {
    assertions: {
      zh: [{
        file: "09_網站頁面草稿與受眾版本/03_60項事件網站路由與呈現層級.md",
        includes: ["中央災害應變中心參訪", "防災、基礎建設韌性與工程公共責任"],
      }],
      en: [{
        file: "09_網站頁面草稿與受眾版本/09-02_關於我與CV_About_CV/01_About_CV_Page_Copy_EN.md",
        includes: ["Civil Engineering teaches responsibility for safety, scale, resilience, and failure"],
      }],
    },
    markdown: {
      zh: `### 從防災體系理解土木工程的公共責任

參訪中央災害應變中心，讓我更具體地看見土木工程如何連結防災、基礎建設韌性、跨單位協調與公共責任。工程系統的價值不只在平時是否運作順利，也在災害等高壓情境下，能否支撐社會有效應變。

### 這次參訪帶來的視角

這次參訪並不是專業實務經歷，卻拓展了我的工程視野。基礎建設牽涉規模、安全、韌性與失效後果；防災工作也提醒我，技術判斷必須能被不同單位理解，並在公共責任的框架下落實。`,
      en: `### Connecting civil engineering to public systems

A visit to the Central Emergency Operations Center gave me a more concrete view of how civil engineering supports disaster response, infrastructure resilience, cross-agency coordination, and public responsibility. An engineering system must not only function under routine conditions; it must also support an effective societal response under pressure.

### Perspective gained from the visit

This was not professional practice, but it broadened my engineering perspective. Infrastructure raises questions of scale, safety, resilience, and the consequences of failure, while disaster response shows why technical judgment must be understandable and actionable across institutions.`,
    },
  },
};

const routes = {
  "event-001": "/experience/jinhua-primary-school",
  "event-002": "/experience/zhongzheng-junior-high",
  "event-003": "/experience/chien-kuo-gifted-class",
  "event-004": "/experience/ntu-academic-journey",
  "event-005": "/experience/ntu-mechanical-engineering",
  "event-006": "/experience/ntu-civil-engineering",
  "event-007": "/experience/ntu-mathematics-minor",
  "event-008": "/experience/ntu-academic-excellence-award",
  "event-009": "/experience/ntu-gpa-a-plus-record",
  "event-011": "/experience/joining-ntu-biorola",
  "event-014": "/writing/mathematica-curvilinear-basis",
  "event-015": "/writing/engineering-mathematics-notes",
  "event-021": "/experience/chien-kuo-mathematics-competition",
  "event-022": "/experience/apmoc-apmo-tmo-selection",
  "event-023": "/experience/trml-captain-2020-2021",
  "event-024": "/experience/geometry-covering-science-fair-honor",
  "event-025": "/experience/chien-kuo-chorus-best-soloist",
  "event-026": "/experience/ntu-peer-review-sessions",
  "event-027": "/experience/chien-kuo-science-club-teaching",
  "event-028": "/experience/qingshui-science-outreach",
  "event-029": "/experience/zhongshan-primary-science-camp",
  "event-030": "/experience/renai-junior-high-science-camp",
  "event-031": "/experience/gouzikou-after-school-tutoring",
  "event-032": "/experience/ntu-bicycle-service-week",
  "event-033": "/experience/international-student-document-support",
  "event-034": "/experience/international-student-campus-support",
  "event-035": "/experience/cross-cultural-taiwan-exchange",
  "event-036": "/experience/chien-kuo-overseas-program-planning",
  "event-037": "/experience/chien-kuo-research-presentation-lead",
  "event-038": "/experience/ntu-civil-engineering-camp",
  "event-039": "/experience/ntu-mechanical-orientation-staff",
  "event-040": "/experience/ntu-chien-kuo-beiyi-week",
  "event-041": "/experience/ef-tokyo-study-abroad",
  "event-042": "/experience/ntu-mechanical-baseball-team",
  "event-043": "/experience/ntu-civil-night-vocalist",
  "event-044": "/experience/premier12-2024-fan-memory",
  "event-045": "/experience/baseball-fandom",
  "event-047": "/writing/software",
  "event-048": "/experience/rongshu-cup-2019-2020",
  "event-049": "/experience/gifted-mathematics-camp-2020",
  "event-050": "/experience/amc-10a-2020",
  "event-051": "/experience/apx-2021",
  "event-052": "/experience/tmt8-2018",
  "event-053": "/experience/national-math-olympiad-grade-9",
  "event-054": "/experience/jhmc",
  "event-055": "/experience/mathleague-2016",
  "event-056": "/experience/tamc7-2016",
  "event-057": "/experience/class-discipline-officer",
  "event-058": "/writing/teaching/taylor-series-video",
  "event-059": "/writing/mathematical-popular-writing-2021",
  "event-060": "/experience/central-emergency-operations-center-visit",
};

const englishEditorialReplacements = {
  "event-008": [["The Academic Excellence Award is best read alongside my transcript, three all-A+ academic foundations, and Coursework portfolio. The honor verifies performance; the final reports, derivations, experiments, and projects show how I put knowledge into practice.", "The Academic Excellence Award complements a record that includes three all-A+ academic foundations. Final reports, derivations, experiments, and projects show how that preparation is applied in practice."]],
  "event-002": [
    ["my primary goal was still admissions-oriented: entering the high school I hoped to attend", "my primary goal was still to gain admission to the high school I hoped to attend"],
    ["wait for a teacher to reach a topic", "wait for a teacher to cover a topic"],
  ],
  "event-003": [["an environment with such a concentrated level of mathematical and scientific ability", "an environment with such a concentration of mathematical and scientific talent"]],
  "event-015": [["The page count is not the point. The real evidence of depth lies in the complete derivations, maps connecting concepts, examples cross-checked computationally, and the way this knowledge returns to problems in control, mechanics, and research. More than 1,600 pages record not a single burst of effort, but a learning method that can be revised, reorganized, and explained to others over time.", "The collection now exceeds 1,600 pages, but its value lies in the complete derivations, maps between concepts, computational cross-checks, and later applications in control, mechanics, and research. The notes have developed over time into a resource that I can revise, reorganize, and use in teaching."]],
  "event-021": [["a peer environment with an unusually high concentration of strength in mathematics and science", "a peer group with an unusually high concentration of mathematical and scientific talent"]],
  "event-024": [
    ["The Excellence Award was the formal outcome of entering, presenting, and submitting the geometric covering study for review.", "The Excellence Award was the formal result of submitting the geometric covering study, presenting it, and undergoing external review."],
    ["The Excellence Award was the formal result of submitting the geometric covering study, presenting it, and undergoing external review. A separate case study explains the research question, method, six-region classification, and limitations; this record focuses on what it meant for the work to undergo public evaluation and receive recognition.", "The geometric-covering study received an Excellence Award after written submission, presentation, and external evaluation. The award followed a complete cycle of problem definition, mathematical analysis, reporting, and public presentation."],
  ],
  "event-025": [["This experience belongs on the personal side of Personal or About. It should not compete with research outcomes for homepage prominence, but it naturally conveys stage communication, collaboration, and an interest in music.", "Although this experience sits outside my research work, it reflects stage communication, collaboration, and a sustained interest in music."]],
  "event-027": [["help another person enter a problem", "help another person engage with a problem"]],
  "event-028": [["connect the question with an experience immediately before them", "connect the question with something students can observe firsthand"]],
  "event-029": [["learning experiences that other students could enter themselves", "learning experiences that other students could explore for themselves"]],
  "event-030": [
    ["This experience does not need extensive space on a research-oriented homepage, but it demonstrates that teaching and service are not labels added later for an application. They are long-standing habits that began in high school and continued through university.", "The experience shows that teaching and service have been longstanding commitments, beginning in high school and continuing through university."],
    ["The Ren'ai Junior High School science camp was one of two service science camps organized by my gifted class during high school. The original materials identify its formal Chinese title as “2020 Science Blueprint: Joint Chien Kuo–Taipei First Girls Gifted-Class Camp.” The program included lessons, original handouts, experiments, gifted-program experience sharing, and a practice examination prepared by students from the two high schools' gifted classes. I contributed to mathematics-material design and lesson preparation, and the surviving number-theory and geometry-theorem files preserve some of the actual content.", "The Ren'ai Junior High School science camp, formally titled “2020 Science Blueprint: Joint Chien Kuo–Taipei First Girls Gifted-Class Camp,” was one of two service camps organized by my gifted class. Students from both schools prepared lessons, original handouts, experiments, gifted-program discussions, and a practice examination. I contributed to mathematics-material design and lesson preparation in number theory and geometry."],
  ],
  "event-033": [["I do not attribute the official decision to myself. What matters is that, through a long and uncertain period, I helped another person move a difficult problem forward one step at a time. The experience taught me that cross-cultural support requires more than English. It also requires patience, empathy, disciplined follow-through, and respect for institutional processes.", "The official decision was made by the responsible authorities. My role was to help the student clarify the problem, organize the available information, and follow up through the appropriate channels. The experience required patience, empathy, and respect for institutional processes."]],
  "event-037": [
    ["distinguish whether an event reached the stage from whether the team fulfilled its responsibility to deliver", "distinguish whether an event ultimately took place as planned from whether the team fulfilled its responsibility to deliver"],
    ["The proposal was reorganized twice. When a major change occurred, three deputy coordinators and I worked until 2:00 a.m. to convert the physical event into a deliverable recorded format. The in-person symposium ultimately did not take place, but the sustained preparation, complete plan, conflict coordination, and alternative delivery were all completed. The experience taught me to distinguish whether an event ultimately took place as planned from whether the team fulfilled its responsibility to deliver.", "The proposal was reorganized twice. When a major change occurred, three deputy coordinators and I worked until 2:00 a.m. to convert the physical event into recorded presentations. Although the in-person symposium was cancelled, the team completed the plan, resolved scheduling conflicts, and produced the alternative presentation format. The experience taught me to distinguish an event’s final format from the team’s responsibility to complete its work."],
  ],
  "event-039": [
    ["This activity does not need to be framed as a grand leadership story. It more appropriately presents a fundamental and important team attitude: understand one's role, deliver on time, and be willing to step in when another person needs support.", "Rather than a grand leadership story, the experience reflects a fundamental team ethic: understand one's role, deliver on time, and step in when others need support."],
    ["Rather than a grand leadership story, the experience reflects a fundamental team ethic: understand one's role, deliver on time, and step in when others need support.", "The role reinforced a practical team ethic: understand the assignment, deliver on time, and support others when additional help is needed."],
  ],
  "event-040": [["What deserves to be preserved from this experience is not the activity title, but time management and commitment: even when coursework, research, and other responsibilities were already demanding, I still completed the work I had promised the team.", "The experience required careful time management and follow-through alongside coursework, research, and other responsibilities."]],
  "event-043": [["the team practice of rehearsing with musicians", "the collaborative process of rehearsing with musicians"]],
  "event-047": [["I use GitHub to maintain code, documentation, and reproducible examples that can be shared publicly. Each public repository corresponds to a defined research or project effort and explains the problem, my contribution, installation procedure, results, limitations, and license. It is not merely a place to store code, but a technical record that makes the engineering process understandable and reproducible.", "I use GitHub to maintain public code, documentation, and reproducible examples for research and engineering projects. Each repository explains the problem, my contribution, installation procedure, results, limitations, and license so that the work can be understood and reproduced."], ["Public profile:", "GitHub profile:"]],
  "event-048": [["reenter a similar but never identical problem environment", "return to a similar—but never identical—problem-solving environment"]],
  "event-049": [["This experience belongs within the complete learning trajectory. It is not an individual award, but evidence that I continued seeking advanced training and willingly devoted time outside class to understanding mathematics. That curiosity-driven way of learning later extended into my mathematics minor and sustained work in Numerical Analysis, Introduction to Mathematical Analysis, and Engineering Mathematics.", "The camp reinforced a pattern that had already begun: I continued seeking advanced training and willingly devoted time outside class to understanding mathematics. That curiosity-driven approach later carried into my mathematics minor and sustained work in Numerical Analysis, Introduction to Mathematical Analysis, and Engineering Mathematics."]],
  "event-050": [["earned 97.5, placed at PR 92", "earned a score of 97.5 and ranked in the 92nd percentile (PR 92)"]],
  "event-052": [["competition exploration", "competition experience"]],
  "event-053": [["Unlike calculation performed through a fixed procedure", "Unlike routine calculation using a fixed procedure"]],
  "event-055": [["its most important role is to complete the growth trajectory", "its most important role is to document this stage of my growth"]],
  "event-056": [["This result is part of my early mathematical learning trajectory. It does not need to be enlarged into a standalone homepage feature, but it shows clearly that before entering Chien Kuo High School, I had already been seeking problems beyond the curriculum over an extended period and developing habits for addressing unfamiliar questions, managing time, and checking methods.", "This result marks an early point in a sustained pattern of seeking problems beyond the curriculum and developing strategies for unfamiliar questions, time management, and method checking before I entered Chien Kuo High School."]],
};

const traditionalChineseEditorialReplacements = {
  "event-003": [
    ["當年的入學與班級甄選使用不同計分制度：其中一項錄取門檻約為 200 分；另一套班級選拔紀錄中，門檻為 1524.6，我的成績為 1727.74，高出門檻 203.14。兩組數字屬於不同尺度，不能直接互換；分開閱讀時，它們共同呈現我進入全臺最具競爭力的高中數理環境之一時，已具備的早期學術實力。", "當年的入學與班級甄選採用不同計分制度：其中一項錄取門檻約為 200 分；另一項班級選拔門檻為 1524.6，我的成績為 1727.74，高出門檻 203.14。兩組數字不能直接比較，但分別對照各自門檻，兩項甄選結果均達錄取標準。"],
    ["海外學習完成籌備後因疫情取消、未成行；成發實體活動取消後，團隊改以錄影上傳完成替代交付。", "海外學習完成籌備後因疫情取消、未成行；研究成果發表會的實體活動取消後，團隊改以錄影發表。"],
  ],
  "event-008": [["書卷獎適合和成績單、三條全 A+ 的學術主幹及 Coursework 作品一起閱讀：榮譽證明表現，期末報告、推導、實驗與專案則證明我如何把知識真正用出來。", "書卷獎與成績單、三組成績皆為 A+ 的核心課程群及代表課程成果，共同呈現我的學業表現；期末報告、推導、實驗與專案，則記錄我如何把課堂所學落實於研究與工程。"]],
  "event-009": [
    ["八個學期共完成 163 個實得學分", "八個學期共取得 163 學分"],
    ["與目前研究方向密切相關的三項主幹", "與目前研究方向密切相關的三組核心課程"],
    ["20 筆計分紀錄、50 學分全數 A+", "20 門計分課程、50 學分全數 A+"],
  ],
  "event-021": [["高一便在全校數學能力競賽獲得二等獎，證明早期累積的數學直覺與解題基礎，能夠延伸到更高強度的環境；之後連續三年獲獎，則把一次突出的結果轉化為具有時間跨度的穩定紀錄。", "高一在全校數學能力競賽獲得二等獎，之後連續三年獲獎，形成跨越三個學年的穩定紀錄。"]],
  "event-028": [["現有物理講義以摩擦力與「交疊書本」為入口", "營隊物理講義以摩擦力與「交疊書本」為切入點"]],
  "event-024": [["這項優等獎是幾何覆蓋研究完成參展、發表與評審後取得的正式成果。完整研究另有獨立案例說明問題、方法、六區分類結果與限制；此處聚焦在研究接受公開檢驗並獲得肯定的意義。", "這項優等獎是幾何覆蓋研究經參展、發表與評審後取得的正式成果。研究內容涵蓋問題定義、方法、六區分類結果與限制；獎項則反映該研究經公開發表後獲得的肯定。"]],
  "event-025": [["這項經歷適合放在 Personal 或 About 的人格側面，不應與研究成果爭奪首頁，但能自然呈現舞台表達、合作與音樂興趣。", "這段舞台經驗也延續到後來的大學演出，讓音樂成為我在研究與課業之外，練習表達、傾聽與合作的重要部分。"]],
  "event-030": [
    ["這段經驗雖然不需要在研究型首頁佔很大篇幅，卻能證明教學與服務不是後來為了申請才加入的標籤，而是從高中延續至大學的長期習慣。", "這段經驗也說明，教學與服務並非短期活動，而是從高中延續至大學的長期投入。"],
    ["仁愛國中的科學營是我高中兩次數資班服務科學營之一。原始資料顯示正式名稱為「2020 科學藍圖 建北數資營」，內容包含建中／北一女數資班學生準備的課程、自編講義、實驗、數資生活分享與模擬考。我參與數學教材設計與教學準備；既有數論、幾何定理等檔案也保留了實際內容。", "仁愛國中的科學營正式名稱為「2020 科學藍圖 建北數資營」，是我高中參與的兩次數資班服務科學營之一。營隊由建中與北一女數資班學生共同準備課程、自編講義、實驗、數資生活分享與模擬考；我參與數論與幾何等數學教材的設計與教學準備。"],
  ],
  "event-037": [["最困難的工作之一，是把兩天流程切成足夠細的時段，讓每位工作人員在特定時間都清楚自己的任務。我反覆和學校及同學討論、調整細節；企劃書重整兩次，遇到重大變動時，我也和三位總副召工作到凌晨兩點，把實體活動轉為可交付的錄影版本。實體活動最終沒有舉行，但長期籌備、完整計畫、衝突協調與替代成果都確實完成；這也讓我學會把「活動是否登場」與「團隊是否負責完成交付」分開判斷。", "最困難的工作之一，是把兩天流程切成足夠細的時段，讓每位工作人員都清楚各時段的任務。我反覆與學校及同學討論並調整細節；企劃書重整兩次，遇到重大變動時，也和三位總副召工作到凌晨兩點，把實體活動改為錄影發表。雖然實體活動最終取消，團隊仍完成計畫、協調衝突，並如期完成替代成果；這段經驗也讓我學會區分活動形式與團隊對工作的責任。"]],
  "event-039": [["這項活動不需要寫成宏大的領導故事；它更適合呈現一種基本而重要的團隊態度：知道自己的位置、準時交付，也願意在別人需要時補位。", "這段經驗讓我建立一項基本而重要的團隊習慣：了解自己的責任、準時完成工作，也在他人需要時主動補位。"]],
  "event-040": [
    ["這段經驗最值得保留的不是活動頭銜，而是時間管理與責任感：即使課業、研究與其他工作已經繁忙，我仍完成自己答應團隊的事情。", "在課業、研究與其他責任並行的情況下，我仍按時完成對團隊承諾的工作；這段經驗也進一步訓練我的時間管理與責任感。"],
    ["這段經驗最值得保留的不是活動頭銜，而是時間管理與承諾：在課業、研究與其他責任已經很滿的情況下，仍把答應團隊的工作做好。", "在課業、研究與其他責任並行的情況下，我仍按時完成對團隊承諾的工作；這段經驗也進一步訓練我的時間管理與責任感。"],
  ],
  "event-047": [["我以 GitHub 保存可公開的程式、文件與可重現範例。每個公開 repository 都對應一項明確的研究或專案，並交代問題、本人貢獻、安裝方式、結果、限制與授權；它不只是程式碼存放處，也是讓工程過程能被理解與重現的技術紀錄。", "我以 GitHub 維護研究與工程專案的公開程式、文件與可重現範例。每個儲存庫均說明問題、我的貢獻、安裝方式、結果、限制與授權，方便他人理解並重現相關工作。"], ["公開帳號：", "GitHub 帳號："]],
  "event-058": [["高中科研社線上社展中，我以 25 分 18 秒影片完整講解泰勒展開式。這段作品讓人看見我如何把抽象公式拆成動機、近似、推導與使用情境，也記錄了我在鏡頭前進行長篇數學說明的早期訓練。", "高中科研社線上社展中，我以 25 分 18 秒影片完整講解泰勒展開式，從動機、近似與推導一路說明至應用情境；這也是我早期以長篇影音形式進行數學教學的作品。"]],
  "event-059": [["2021 年撰寫數學科普內容，介紹集合、對射、可數／不可數與 Cantor diagonal argument，嘗試讓抽象概念保留嚴謹，同時讓高中讀者能找到直覺入口。", "2021 年撰寫數學科普內容，介紹集合、對射、可數／不可數與 Cantor 對角線論證，兼顧概念的嚴謹性，也為高中讀者提供直觀的理解途徑。"], ["把知識的延伸關係整理成別人也能走進去的路", "整理概念之間的關係，讓其他讀者能循序理解"]],
  "event-049": [["這段經歷適合放在完整學習脈絡中：它不是單一獎項，而是我持續尋找進階訓練、願意投入課外時間理解數學的證據。這種由好奇心驅動的學習方式，後來延伸到數學輔系、數值分析、分析導論與工程數學的長期訓練。", "這次研習延續了我主動尋找進階訓練、投入課外時間理解數學的習慣。由好奇心驅動的學習方式，後來也延伸到數學輔系，以及數值分析、分析導論與工程數學的長期訓練。"]],
  "event-056": [["這項成績是我早期數學學習軌跡的一部分。它不需要在首頁單獨放大，但能清楚說明：在進入建中以前，我已長期主動接觸課本以外的題目，也逐步累積面對陌生問題、管理時間與檢查方法的習慣。", "這項成績記錄我在進入建中以前，已長期主動接觸課本以外的題目，也逐步養成面對陌生問題、分配時間與檢查解法的習慣。"]],
};

function polishEnglishMarkdown(eventId, markdown) {
  return (englishEditorialReplacements[eventId] ?? []).reduce(
    (current, [before, after]) => current.replaceAll(before, after),
    markdown,
  );
}

function polishTraditionalChineseMarkdown(eventId, markdown) {
  return (traditionalChineseEditorialReplacements[eventId] ?? []).reduce(
    (current, [before, after]) => current.replaceAll(before, after),
    markdown,
  );
}

function readSource(relativeDirectory, locale) {
  const fileName = locale === "zh" ? "00_網站文案草稿.md" : "01_Website_Copy_EN.md";
  return fs.readFileSync(path.join(referenceRoot, ...relativeDirectory.split("/"), fileName), "utf8")
    .replace(/\r\n?/g, "\n");
}

function readReferenceFile(relativeFile) {
  return fs.readFileSync(path.join(referenceRoot, ...relativeFile.split("/")), "utf8")
    .replace(/\r\n?/g, "\n");
}

function assertAggregateSources(eventId, bundle) {
  for (const locale of ["en", "zh"]) {
    for (const assertion of bundle.assertions[locale]) {
      const source = readReferenceFile(assertion.file);
      for (const excerpt of assertion.includes) {
        if (!source.includes(excerpt)) {
          throw new Error(`Missing authoritative excerpt for ${eventId} (${locale}): ${excerpt}`);
        }
      }
    }
  }
}

function sectionBody(markdown, heading) {
  const lines = markdown.split("\n");
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start < 0) throw new Error(`Missing public section: ${heading}`);
  let end = start + 1;
  while (end < lines.length && !/^##\s+/.test(lines[end])) end += 1;
  return lines.slice(start + 1, end).join("\n").trim();
}

function publicMarkdown(eventId, locale, markdown) {
  if (eventId === "event-047") {
    return sectionBody(markdown, locale === "zh" ? "公開頁面文案" : "Public Page Copy");
  }

  if (eventId === "event-011" && locale === "en") {
    return sectionBody(markdown, "Public Detail Page Copy");
  }

  return sectionBody(
    markdown,
    locale === "zh" ? "公開詳情頁文案" : "Public Detail-Page Copy",
  );
}

function cells(line) {
  return line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
}

function isTableDivider(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function blocksFromMarkdown(markdown) {
  const lines = markdown.split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{3,4})\s+(.+)$/);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2].trim() });
      index += 1;
      continue;
    }

    if (line.startsWith("|") && index + 1 < lines.length && isTableDivider(lines[index + 1])) {
      const headers = cells(line);
      index += 2;
      const rows = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        rows.push(cells(lines[index]));
        index += 1;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    const unordered = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      const orderedList = Boolean(ordered);
      const items = [];
      while (index < lines.length) {
        const candidate = lines[index].trim();
        const item = orderedList
          ? candidate.match(/^\d+[.)]\s+(.+)$/)
          : candidate.match(/^[-*]\s+(.+)$/);
        if (!item) break;
        items.push(item[1].trim());
        index += 1;
      }
      blocks.push({ type: "list", ordered: orderedList, items });
      continue;
    }

    const paragraph = [line.replace(/^>\s?/, "")];
    index += 1;
    while (index < lines.length) {
      const candidate = lines[index].trim();
      if (!candidate) break;
      if (/^#{3,4}\s+/.test(candidate)) break;
      if (/^[-*]\s+/.test(candidate) || /^\d+[.)]\s+/.test(candidate)) break;
      if (candidate.startsWith("|") && index + 1 < lines.length && isTableDivider(lines[index + 1])) break;
      paragraph.push(candidate.replace(/^>\s?/, ""));
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }

  return blocks;
}

function assertVisitorSafe(value, eventId) {
  const text = JSON.stringify(value);
  const forbidden = [
    /[A-Za-z]:\\\\/,
    /(?:^|[\\/])Users[\\/]/i,
    /(?:參考資料|學術申請用網站)[\\/]/,
    /canonical_source/i,
    /local_only/i,
    /visibility\s*:/i,
    /Internal Editorial Notes/i,
    /內部建站註記/,
    /Do Not Publish/i,
    /禁止直接公開/,
    /does not need to be framed/i,
    /這項活動不需要寫成/,
    /best read alongside/i,
  ];
  const hit = forbidden.find((pattern) => pattern.test(text));
  if (hit) throw new Error(`Unsafe visitor-facing content for ${eventId}: ${hit}`);
}

const records = Object.entries(routes).map(([eventId, route]) => {
  const aggregateSource = aggregateSources[eventId];
  if (aggregateSource) {
    assertAggregateSources(eventId, aggregateSource);
    const record = {
      eventId,
      route,
      sourceStatus: "canonical_markdown",
      blocks: {
        en: blocksFromMarkdown(polishEnglishMarkdown(eventId, aggregateSource.markdown.en)),
        zh: blocksFromMarkdown(polishTraditionalChineseMarkdown(eventId, aggregateSource.markdown.zh)),
      },
    };
    assertVisitorSafe(record, eventId);
    return record;
  }

  const source = sources[eventId];
  if (!source) throw new Error(`Missing source mapping for ${eventId}`);
  const record = {
    eventId,
    route,
    sourceStatus: "canonical_markdown",
    blocks: {
      en: blocksFromMarkdown(polishEnglishMarkdown(eventId, publicMarkdown(eventId, "en", readSource(source, "en")))),
      zh: blocksFromMarkdown(polishTraditionalChineseMarkdown(eventId, publicMarkdown(eventId, "zh", readSource(source, "zh")))),
    },
  };
  assertVisitorSafe(record, eventId);
  return record;
});

if (records.length !== 51) throw new Error(`Expected 51 non-case public event records, received ${records.length}`);
if (records.filter((record) => record.sourceStatus === "canonical_markdown").length !== 51) {
  throw new Error("Expected all 51 public-detail records to have canonical bilingual copy");
}
if (records.some((record) => !record.blocks.en.length || !record.blocks.zh.length)) {
  throw new Error("Every public-detail record must contain both English and Traditional Chinese blocks");
}

fs.writeFileSync(outputPath, `${JSON.stringify(records, null, 2)}\n`, "utf8");
console.log(`Generated ${records.length} event detail records at ${path.relative(projectRoot, outputPath)}`);
