export type LiteraryAutobiographyParagraph = {
  sourceIndex: number;
  kind: "title" | "subtitle" | "byline" | "section" | "paragraph";
  zh: string;
  en: string;
};

export const autobiographyFromConfusion = {
  id: "autobiography-from-confusion-to-inner-coherence",
  canonicalRoute: "/writing/autobiography/from-confusion-to-inner-coherence",
  title: {
    zh: "從迷惘到自洽",
    en: "From Losing My Way to Finding Inner Coherence",
  },
  paragraphs: ([
    {
      kind: "title",
      zh: "從迷惘到自洽",
      en: "From Losing My Way to Finding Inner Coherence",
    },
    {
      kind: "subtitle",
      zh: "我一路走來的求學、選擇與人生信念",
      en: "The education, choices, and convictions that have shaped my journey",
    },
    {
      kind: "byline",
      zh: "廖致翔",
      en: "Chih-Hsiang Liao",
    },
    {
      kind: "paragraph",
      zh: "大四某個深夜，實驗室裡只剩電腦風扇、馬達低鳴，以及我們幾個人壓低卻藏不住興奮的聲音。六足機器人站在地上，腿部關節先是輕微顫動，像一隻剛醒來、還在確認身體邊界的動物。幾秒後，它終於照著我們的設定往前走。不是完美的步態，甚至還有一點笨拙；但那一刻，我心裡很清楚：它動起來了。更重要的是，它不是偶然亂動，而是依照我們推導的力學、寫下的控制邏輯、設計的機構與電路，真真切切地在眼前合成一個動作。",
      en: "Late one night in my senior year, the laboratory held only the whir of computer fans, the low hum of motors, and the voices of a few of us—hushed, yet unable to conceal our excitement. The six-legged robot stood on the floor. At first, its leg joints trembled slightly, like an animal just awakened and still testing the boundaries of its own body. A few seconds later, it finally moved forward as we had instructed it to. The gait was not perfect; it was even a little clumsy. But in that moment, I knew with absolute clarity: it was moving. More importantly, it was not moving by accident. Before our eyes, the mechanics we had derived, the control logic we had written, and the mechanisms and circuits we had designed came together, palpably, into a single motion.",
    },
    {
      kind: "paragraph",
      zh: "那一瞬間，我忽然想起很久以前的小五。那時候的我，第一次覺得數學好玩；第一次發現一道題目不是機械式的運算，而是一個可以被拆開、被理解、被重新組裝的世界。從那時到現在，我一路經過得意、失控、懊悔、重建，也一路追問同一件事：我究竟適合什麼？我又願意把自己交給什麼？",
      en: "In that instant, I suddenly remembered myself in fifth grade, long ago. It was then that mathematics first became delightful to me; then that I first discovered a problem was not a mechanical calculation, but a world that could be taken apart, understood, and assembled anew. From that moment to this one, I have passed through pride, loss of control, regret, and reconstruction, while continuing to ask the same questions: What am I truly suited for? And to what am I willing to give myself?",
    },
    {
      kind: "paragraph",
      zh: "這篇文章想說的，不只是我從國小到大學的求學經過。更準確地說，它是一條從無所依憑到逐漸站穩的路：我如何在數學裡看見天賦，在高中裡丟失重心，在大學裡重新長出熱忱，最後把自己安放在機械工程、機器人與物理建模之中。一路走來，我才慢慢明白，人生最珍貴的並不是走上一條看起來最熱門的路，而是走上一條能讓自己內心站得住腳的路。",
      en: "This essay is about more than the course of my education from elementary school to university. More precisely, it traces a path from having nothing firm beneath my feet to gradually learning how to stand: how I recognized a gift in mathematics, lost my center in high school, grew a new devotion to learning in university, and finally found a place for myself in mechanical engineering, robotics, and physical modeling. Along the way, I slowly came to understand that the most precious thing in life is not to take the road that appears most fashionable, but to take one on which the heart itself can stand.",
    },
    {
      kind: "section",
      zh: "一、起點：幸運與早慧",
      en: "I. Beginnings: Good Fortune and an Early Gift",
    },
    {
      kind: "paragraph",
      zh: "從小到大，我算是一個生活幸福、無憂無慮的孩子。很小的時候，讀書對我而言並沒有什麼崇高目的。努力，不過是為了避免被責備；考好，也許能換來獎品、禮物，或是一頓期待很久的大餐。那時候的我並不知道自己這輩子想追求什麼，也談不上有什麼足以支撐人生的目標。只是在大人的安排裡，把該做的事做完。",
      en: "Growing up, I was, by and large, a happy and carefree child. When I was very young, studying held no lofty purpose for me. I worked merely to avoid being scolded; good grades might earn a prize, a gift, or a long-awaited feast. I did not yet know what I wished to pursue in this life, much less possess a goal sturdy enough to sustain one. I simply completed what had been set before me within the plans of the adults around me.",
    },
    {
      kind: "paragraph",
      zh: "其實在更早以前，我甚至談不上鍾情數學。小四以前的數學對我而言，仍像一種重複流程：準確、乏味、機械，只要照著步驟往前推，答案總會出現。真正的轉折，發生在小五、小六。那時候的數學開始需要思考；題目有了彎道，有了暗門，也有了讓人停下來琢磨的餘地。解開一道題時，心裡常常會有一聲很輕的「喀噠」：像鎖被打開，像一小片看不見的機械在腦中順利咬合。那一刻我才感覺到，原來一道題目不是單純算完，而是一個可以被理解、被拆解、被重新組裝的世界。數學讓我快樂。就這樣。",
      en: "Earlier still, I could hardly have said that I loved mathematics. Before fourth grade, it remained a repetitive procedure to me: exact, tedious, mechanical. Follow the steps, and the answer would always appear. The true turning point came in fifth and sixth grade. Mathematics began to demand thought; problems acquired bends in the road, hidden doors, and room to pause and ponder. When I solved one, I would often hear a soft click within: a lock opening, a tiny invisible mechanism meshing smoothly in my mind. Only then did I feel that a problem was not something merely to be calculated to completion, but a world that could be understood, dismantled, and assembled anew. Mathematics made me happy. It was as simple as that.",
    },
    {
      kind: "paragraph",
      zh: "我也在同儕競爭中逐漸意識到，自己在這方面確實比別人駕輕就熟。最早的鍾情，也許來自一點成就感；而成就感又把我推回數學，使我願意投入更多時間。這樣的循環，後來變成我人生最早的方向感。從那時開始，我大致知道自己會走向理工，甚至一度認定未來應該念數學系。",
      en: "Through competition with my peers, I also began to realize that mathematics came more readily to me than it did to others. Perhaps my earliest affection grew from a measure of achievement; that sense of achievement, in turn, drew me back to mathematics and made me willing to give it more of my time. This cycle eventually became the earliest compass of my life. From then on, I knew in broad outline that I would move toward science and engineering, and for a time I was certain that I ought to study mathematics.",
    },
    {
      kind: "paragraph",
      zh: "多年後回看，這是一種極大的幸運。人一生最難得的事情之一，是內在的熱愛與能力的紋路剛好重疊。若一個人深愛某件事，卻總是在能力邊緣痛苦掙扎，那份熱愛很容易變得卑微；若一個人擅長某件事，卻對它毫無感召，那份能力又可能成為漫長的消耗。我並不是一開始就懂得珍惜這份幸運，只是很早就站在它裡面，還不知道它的重量。",
      en: "Looking back years later, I see this as an extraordinary stroke of fortune. One of the rarest gifts in a life is for the contours of one’s inward love to coincide with the contours of one’s ability. If someone loves a pursuit deeply yet must forever struggle at the edge of their capacity, that love can easily be made to feel small; if someone excels at something that calls to them not at all, that ability can become a long attrition of the spirit. I did not understand from the beginning how to treasure this fortune. I simply stood within it early, without yet knowing its weight.",
    },
    {
      kind: "paragraph",
      zh: "到了國中，這份方向感變得更強烈。我開始不滿足於學校教的內容，自己買課外讀物，搜尋數學知識，甚至在國文課聽不下去時，偷偷翻開微積分書。現在想來，那當然不是什麼值得鼓勵的課堂行為；但那也確實說明了一件事：我第一次真切體會到，當一個人渴望某門知識時，會願意把所有零碎時間都交給它。那不是為了考試，也不是為了名次，而是一種想把一切看清楚的飢渴。",
      en: "By junior high, that sense of direction had grown stronger. What school taught no longer satisfied me. I bought books beyond the curriculum, searched for mathematics on my own, and even, when I could no longer bear to keep listening in Chinese class, secretly opened a calculus textbook. In retrospect, this was hardly classroom behavior to encourage. Yet it did reveal something real: for the first time, I understood in my bones that when someone longs for a field of knowledge, they will surrender every stray fragment of time to it. This was not for an examination or a ranking, but from a hunger to see everything clearly.",
    },
    {
      kind: "paragraph",
      zh: "也正是在那時，我學會了自學。學校進度之外，還有更廣大的世界；課本之外，還有無數我想知道卻沒有人主動告訴我的問題。數學在我心中不再只是科目，而像一種語言，一種可以把混亂變成秩序、把模糊變成清楚的語言。這份對知識的渴望，後來成為我很深的底色。",
      en: "It was also then that I learned how to teach myself. Beyond the school syllabus lay a far larger world; beyond the textbook lay innumerable questions I wanted to understand, though no one had thought to tell me about them. In my mind, mathematics ceased to be merely a subject. It became a language—a language capable of turning disorder into order and ambiguity into clarity. That hunger for knowledge would become one of the deepest colors in the ground of who I am.",
    },
    {
      kind: "paragraph",
      zh: "只是，當時的我並不懂得欣賞所有理工科目。尤其是物理，我曾經有過近乎輕視的態度。國中時的物理在我眼裡像背科，充滿文字敘述，缺乏我所追求的嚴謹與純粹。我以為數學才是一切根本，物理只是粗糙地借用數學。那時我還不知道，真正讓我日後著迷的物理，只是暫時被不夠成熟的數學工具遮住了光。",
      en: "Yet at the time, I did not know how to appreciate every field of science and engineering. Physics, in particular, I regarded with something close to disdain. Junior-high physics seemed to me a subject of memorization, crowded with verbal descriptions and lacking the rigor and purity I sought. I believed mathematics was the foundation of everything, while physics merely borrowed from it crudely. I did not yet know that the physics that would one day captivate me had only been dimmed for a while by mathematical tools not yet mature enough to reveal its light.",
    },
    {
      kind: "section",
      zh: "二、轉折：迷惘的高中",
      en: "II. Turning: The Disorientation of High School",
    },
    {
      kind: "paragraph",
      zh: "帶著國中累積的數學底子與過度膨脹的自信，我考進建國中學數理資優班。那時的我自負得近乎天真，甚至以為自己是全台北數學最好的學生。高出錄取門檻許多的分數，幾乎都來自數學；至於物理、化學、生物與地科，我其實只是普通國中生的程度，沒有超修，也沒有真正的興趣。",
      en: "Carrying the mathematical foundation I had built in junior high—and an overinflated confidence—I entered the mathematics and science gifted program at Taipei Municipal Chien Kuo High School. My self-assurance then bordered on naïveté: I even imagined I might be the best mathematics student in all of Taipei. The score that placed me well above the admission threshold came almost entirely from mathematics. In physics, chemistry, biology, and earth science, I was in truth no more advanced than an ordinary junior-high student: I had studied none of them ahead of schedule and felt no genuine interest in them.",
    },
    {
      kind: "paragraph",
      zh: "高中以前，我很少真正問自己讀書是為了什麼。大多數科目，是為了不要被罵、不要丟臉；數學，是因為我願意。這些理由在國中以前似乎夠用，卻不足以支撐一個人進入更自由、更複雜的世界。進入高中後，那個世界忽然向我打開。",
      en: "Before high school, I had seldom truly asked myself why I studied. For most subjects, it was to avoid being scolded or embarrassed; for mathematics, it was because I wanted to. Those reasons seemed sufficient through junior high, but they could not sustain a person entering a freer, more complicated world. Once I entered high school, that world suddenly opened before me.",
    },
    {
      kind: "paragraph",
      zh: "建中對當時的我而言，像一道突然照下來的強光。自由的學風、多元的社團、各式各樣的活動、聯誼、營隊，以及手機與外界帶來的無數刺激，一起湧到眼前。我像是從狹窄的通道衝到空曠的廣場，先感到解放，接著卻被那份沒有邊界的自由照得睜不開眼。原來世界這麼大。原來生活本身也可以這麼迷人。",
      en: "Chien Kuo, to the person I was then, felt like a blaze of light falling without warning. Its culture of freedom, its varied clubs, its activities of every kind, social gatherings, camps, and the endless stimuli arriving through my phone and from the world beyond—all flooded into view at once. It was as if I had rushed from a narrow passage into an open square: first came liberation, and then a freedom so boundless and bright that I could no longer keep my eyes open. So this was how large the world was. So life itself could be this alluring.",
    },
    {
      kind: "paragraph",
      zh: "於是，我像脫韁野馬一樣放下了讀書。更準確地說，我把讀書視為過去高壓生活的象徵，於是連同它一起反抗。那時我心裡其實有一個幼稚卻真實的反問：難道我的人生只能一直讀書嗎？那不是單純的懶惰，而是一種扭曲的補償：我不想承認自己的人生過去幾乎只剩下成績與排名，所以乾脆把最拿得出手的能力也一併丟掉，彷彿這樣就能證明自己終於活成一個真正自由的人。只是我沒有意識到，自己推開的不只是壓力，也正在推開最能支撐我的能力。",
      en: "And so I abandoned my studies like a horse breaking free of its reins. More precisely, I came to see studying as a symbol of the high-pressure life I had led, and rebelled against both as though they were one. A childish but honest question was rising in me: Must my whole life be nothing but study? This was not simply laziness, but a distorted form of compensation. I did not want to admit that my life until then had been reduced almost entirely to grades and rankings, so I cast aside even the ability I had most reason to be proud of—as though doing so could prove that I had finally become a genuinely free person. What I failed to see was that I was not only pushing away the pressure; I was also pushing away the very capacity most able to hold me up.",
    },
    {
      kind: "paragraph",
      zh: "可自由若沒有方向，很快就會變成失重。那段時間，我厭惡讀書，也疏於維持原本最珍視的數學。它從全心投入的追求，變成玩手機玩累之後的消遣。物理依舊被我放在偏見裡，沒有真正打開。表面上，我參與活動、體驗青春，生活看似豐富熱鬧；但內心深處，我其實每天都背著沉重的罪惡感。",
      en: "Yet freedom without direction soon becomes weightlessness. During that period, I despised studying and neglected even the mathematics I had once cherished most. What had been a wholehearted pursuit became something I turned to only after tiring of my phone. Physics remained sealed inside my prejudice, never truly opened. Outwardly, I joined activities and tasted youth; life looked full and lively. Deep within, however, I carried a heavy burden of guilt every day.",
    },
    {
      kind: "paragraph",
      zh: "最痛苦的地方在於，我並非不知道自己會留下遺憾。我清楚明白，不讀書的代價將來一定會到來；也知道自己除了讀書方法與數理能力之外，並沒有太多足以勝過同儕的明顯優勢。可是我仍然不願回頭。這種明知故犯，比單純犯錯更令人難受。因為它不是一時失足，而是清醒地看見懸崖，卻仍然往前走。",
      en: "What hurt most was that I knew perfectly well I would leave myself with regret. I understood that the price of not studying would inevitably arrive, and that beyond knowing how to learn and possessing mathematical ability, I had few obvious advantages that would set me above my peers. Still, I refused to turn back. To do wrong knowingly was more painful than a simple mistake. This was no momentary slip; it was to see the precipice clearly and continue walking toward it.",
    },
    {
      kind: "paragraph",
      zh: "若說自己在高中完全無所依憑，其實也不盡公平。至少我仍知道自己偏向理工，也知道數學曾經是我最深的熱愛。比起那些完全不知道自己適合什麼、只能依照分數與熱門程度選路的人，我並不是最徬徨的一個。但正因如此，我更難原諒自己：我手上明明有羅盤，卻把它收起來不用。",
      en: "It would not be entirely fair to say that I had nothing to hold on to in high school. I still knew, at least, that I leaned toward science and engineering, and that mathematics had once been my deepest love. Compared with those who had no idea what suited them and could choose only by score or popularity, I was not the most lost. But that made it harder to forgive myself: I had a compass in my hand, and chose to put it away.",
    },
    {
      kind: "paragraph",
      zh: "高中也讓我第一次更真切地看見台灣教育裡某種結構性的可惜。許多人不是因為真正理解自己而選科系，而是因為分數到了、科系熱門、未來薪水看似不錯，便往那裡去。有人熱愛的事與能力分離，有人擅長的事與心意背離。那時的我還不夠成熟，無法說出完整道理；但我已經隱約明白，一個人若沒有找到內在契合的位置，即使外在看起來順利，也可能走得很辛苦。",
      en: "High school also allowed me, for the first time, to see more clearly a certain structural sorrow within Taiwan’s education system. Many people choose a field not because they truly understand themselves, but because their score permits it, the major is popular, and the future salary appears promising. For some, what they love is separated from what they can do; for others, what they do well diverges from what their heart desires. I was not yet mature enough to articulate the whole argument, but I had begun to sense that if a person never finds a place of inward fit, even a life that looks smooth from the outside may be painfully hard to walk.",
    },
    {
      kind: "section",
      zh: "三、覺醒：把人生交還給自己",
      en: "III. Awakening: Returning My Life to Myself",
    },
    {
      kind: "paragraph",
      zh: "回望高中，我常覺得那是一段「後悔，但深層而言又不後悔」的日子。我後悔的是，自己明明知道某些選擇會讓未來的我痛苦，卻仍然任性地執意而為。這不是青春的浪漫，而是對自己的不負責。可另一方面，我也無法否認，那三年確實迫使我長大。它讓我社會化，讓我學會與人相處、合作、辦事、籌備活動，也讓我真正體驗到課本以外的青春。",
      en: "When I look back on high school, I often think of those years as a time I regret and yet, at a deeper level, do not regret. I regret knowing that certain choices would cause my future self pain and stubbornly making them anyway. That was not the romance of youth; it was a failure to take responsibility for myself. Yet I cannot deny that those three years forced me to grow. They taught me how to navigate the social world—how to relate to people, collaborate, get things done, and organize events—and allowed me to experience a youth that existed beyond textbooks.",
    },
    {
      kind: "paragraph",
      zh: "更重要的是，它讓我第一次嚴肅地面對人生。從小到大，父母與老師替我規劃大部分道路，我只要沿著軌道前進，就能得到相對不錯的結果。高中卻把軌道拆掉了。當外在規範鬆開，我才發現自己並沒有真正準備好替人生掌舵。讓我真正懂得負責的，不是過去的順利，而是那三年的失速。",
      en: "More importantly, those years made me confront my life seriously for the first time. Throughout childhood, my parents and teachers had planned most of the road for me; as long as I stayed on the tracks, I could expect reasonably good results. High school dismantled those tracks. Only when the external rules loosened did I discover that I had never truly learned to take the helm of my own life. What taught me responsibility was not the smooth passage that came before, but the stall of those three years.",
    },
    {
      kind: "paragraph",
      zh: "於是，我逐漸形成一套後來支撐自己的原則：做任何重要選擇之前，都要把未來的自己也請到桌前。我要問清楚：我為什麼做這件事？它通往什麼目標？多年後回頭，我能不能問心無愧？如果當下已經明白未來必然留下沉重虧欠，卻仍然執意去做，那就是我最不能接受的選擇。高中時的我，正是犯了這個錯。",
      en: "Gradually, I formed a principle that would later sustain me: before making any important choice, I must invite my future self to the table. I must ask plainly: Why am I doing this? What end does it lead toward? When I look back years from now, will my conscience be clear? If I already understand that a choice will leave my future self with a grave debt, and insist upon it nonetheless, then it is the kind of choice I find least acceptable. That was precisely the mistake I made in high school.",
    },
    {
      kind: "paragraph",
      zh: "這個原則並不是要求人生永遠選擇最安全、最功利、最不會失敗的道路。相反地，如果某個選擇在當下已經被我誠實思考過，而我真心認為它不會讓未來的自己無法面對，那麼即使結果不如預期，我也不該把它視為可恥的失敗。人生有太多不可控因素；問心無愧的選擇未必保證成功，但能保證人不被懊悔拖垮。",
      en: "This principle does not demand that life always take the safest, most utilitarian, or least fallible road. On the contrary, if I have considered a choice honestly in the moment and sincerely believe it will not leave my future self unable to face what I have done, then even if the outcome disappoints me, I should not regard it as a shameful failure. Too much in life lies beyond our control. A choice made with a clear conscience cannot guarantee success, but it can keep regret from pulling a person under.",
    },
    {
      kind: "paragraph",
      zh: "從那時起，我也慢慢建立了另一個理解人生的框架：必然與偶然。所謂必然，是性格、能力、渴望與長期經驗共同推動的大方向。以我而言，走向理工，幾乎是必然；我對數學與理解世界的渴望，早就把我推往那裡。至於偶然，則是分數、制度、家庭一句建議、某一年錄取門檻、某次失敗與某次通過交織出的具體道路。人生不是純粹命定，也不是完全隨機。它更像一條河：水流的方向早有地勢，但每一次轉彎，都受石頭與風雨影響。",
      en: "From then on, I also began to build another framework for understanding life: necessity and chance. Necessity is the broad direction jointly set in motion by character, ability, longing, and accumulated experience. For me, a life in science and engineering was almost inevitable; my hunger for mathematics and for understanding the world had long been carrying me there. Chance, meanwhile, is the particular road woven from scores and systems, a word of advice from family, the admission threshold of a given year, a particular failure and a particular success. Life is neither pure destiny nor complete randomness. It is more like a river: the terrain has already given the water its direction, yet every bend is shaped by stones, wind, and rain.",
    },
    {
      kind: "paragraph",
      zh: "這個框架後來成為我理解大學之路的鑰匙。大方向上，我一定會在理工世界裡尋找自己；但我會進入哪個科系、遇見什麼學問、最後把自己安放在哪裡，卻充滿了機緣。",
      en: "This framework later became the key by which I understood my path through university. In the larger sense, I was certain to search for myself within the world of science and engineering. Yet which department I would enter, which bodies of knowledge I would encounter, and where I would finally come to rest were all suffused with contingency.",
    },
    {
      kind: "section",
      zh: "四、重生：大學裡重新長出的熱忱",
      en: "IV. Rebirth: A Devotion Rekindled at University",
    },
    {
      kind: "paragraph",
      zh: "在真正進入大學之前，我先重新認識了物理。學測前那三個月，我幾乎是用追回失地的方式猛讀物理；這不只是補進度，更像是把一個過去被我誤解的世界重新打開。升學壓力逼我面對那些過去不願碰的科目，也讓我在課餘時間接觸許多科普與知識型內容。那些內容沒有用考試的方式逼近物理，而是從生活出發，讓我第一次感覺到：原來世界上的現象都可以被解釋，原來物理不是背誦，而是一種把自然說清楚的能力。",
      en: "Before I truly entered university, I first came to know physics anew. During the three months before Taiwan’s General Scholastic Ability Test, I studied physics with the intensity of someone reclaiming lost ground. This was more than catching up; it was like reopening a world I had once misunderstood. The pressure of university admission compelled me to face subjects I had avoided, while outside class I encountered a wealth of popular-science and educational content. It did not approach physics through examinations, but began with ordinary life, and for the first time made me feel that the phenomena of the world could be explained—that physics was not memorization, but the ability to make nature intelligible.",
    },
    {
      kind: "paragraph",
      zh: "那些創作者未必知道，自己只是把一個現象講清楚，卻可能真的改變一個學生看待世界的方式。對那時的我而言，他們不是替我補了一個科目，而是替我打開了另一種理解世界的入口。",
      en: "Those creators may never know that, merely by explaining a phenomenon clearly, they can genuinely change the way a student sees the world. For the person I was then, they did not simply help me catch up in a subject; they opened another entrance into understanding the world.",
    },
    {
      kind: "paragraph",
      zh: "印象最深的，是我開始用數學重新理解那些原本只被文字描述的現象。一顆球被拋出去，課本可以說它受重力影響而形成拋物線；但當我知道位置、速度、加速度其實能被微分與方程連在一起，那條拋物線就不再只是圖形，而像自然把力的條件翻譯成軌跡的句子。以前讓我覺得含糊的地方，一旦放進清楚的數學結構裡，忽然變得透明。",
      en: "What remains most vivid is the moment I began to use mathematics to understand anew the phenomena that had previously been described only in words. A textbook can say that a thrown ball follows a parabola under gravity. But once I knew that position, velocity, and acceleration could be joined through differentiation and equations, that parabola ceased to be merely a shape. It became a sentence in which nature translated the conditions of force into a trajectory. What had once seemed vague to me turned suddenly transparent when placed within a clear mathematical structure.",
    },
    {
      kind: "paragraph",
      zh: "那一刻，我才明白自己過去誤會了物理。物理與數學並不是兩個彼此疏離的世界。數學讓物理有骨架，物理讓數學有重量；一個提供語法，一個給出現實。當數學進入物理，許多冗長的文字敘述便收束成簡潔的關係；當物理回到數學，抽象符號又重新落地，變成我們眼前真實運行的世界。我怎麼可能不愛這件事？從那時開始，我不再滿足於知道答案；若一個物理現象無法在心裡形成穩固而融洽的模型，我便會反覆思考，直到自己終於被說服，直到那個現象能在心裡被安放。",
      en: "Only then did I understand how profoundly I had misunderstood physics. Physics and mathematics are not two estranged worlds. Mathematics gives physics a skeleton; physics gives mathematics weight. One supplies the grammar, the other the reality. When mathematics enters physics, long verbal descriptions gather themselves into concise relationships; when physics returns to mathematics, abstract symbols touch ground again and become the world in motion before our eyes. How could I not love this? From then on, knowing the answer was no longer enough. If a physical phenomenon would not form a sound and harmonious model in my mind, I returned to it again and again until I was finally convinced—until the phenomenon could find its place within me.",
    },
    {
      kind: "paragraph",
      zh: "那段時間的焦慮也是真實的。學測前，我甚至一度認為自己大概只能重考；我不相信一個長時間偏離軌道的人，能在短時間內毫無代價地追回一切。那份恐懼讓我更清楚知道，人生不是可以任意透支而不用償還的東西。",
      en: "The anxiety of that period was real as well. Before the examination, I even believed for a time that I would probably have to retake the university entrance examinations the following year. I could not believe that someone who had strayed for so long might recover everything in a short time without cost. That fear taught me with greater clarity that a life cannot be overdrawn at will and never repaid.",
    },
    {
      kind: "paragraph",
      zh: "那時的我其實還分不清理工世界裡每一條道路的差異。電機、土木、機械，在當時看來都像可以接受的可能；我只知道自己仍想留在數學、物理與工程交會的地方，卻還不知道哪一個領域最能讓我安放自己。",
      en: "At the time, I could not yet distinguish clearly among the many roads within science and engineering. Electrical, civil, and mechanical engineering all seemed like acceptable possibilities. I knew only that I wanted to remain where mathematics, physics, and engineering met, but not yet which field could best become a home for me.",
    },
    {
      kind: "paragraph",
      zh: "升學路上，偶然也在此時發生作用。當我原本以為自己大概會重考或指考時，因為父親的建議，我填了國立臺灣大學土木工程學系。那一年錄取情況與我原先預期不同，加上我後來把物理補了上來，二階考試的數學與物理表現足以彌補書面資料的倉促。結果，我竟然真的錄取了台大土木。",
      en: "Chance also began to act upon my path to university. When I had expected that I would probably retake the university entrance examinations the following year or sit for the Advanced Subjects Test, my father’s advice led me to apply to the Department of Civil Engineering at National Taiwan University. Admission results that year differed from what I had anticipated, and because I had caught up in physics, my performance in mathematics and physics during the second-stage examination was enough to compensate for application materials assembled in haste. To my astonishment, I was admitted to NTU Civil Engineering.",
    },
    {
      kind: "paragraph",
      zh: "接受這個結果時，我仍有不安。高中三年的虧欠不可能被一次錄取完全洗淨，我也還沒真正想清楚自己在理工中究竟最適合哪一個位置。但我知道，台大工學院至少是一個我能接受、也有能力重新開始的地方。於是我進入台大，決定給自己一個新的起點。這一次，我不要只是被推著走；我要真正為自己努力一次。",
      en: "Even as I accepted this result, unease remained. Three years of debts to myself could not be washed away by a single admission, and I still had not truly decided where within science and engineering I belonged. Yet I knew that NTU’s College of Engineering was at least a place I could embrace, and a place where I was capable of beginning again. So I entered NTU determined to give myself a new starting point. This time I would not merely allow myself to be pushed along. I would strive, for once, on my own behalf.",
    },
    {
      kind: "paragraph",
      zh: "大學的壓力其實不比高中小。作業更多，考試更難，要求也更高。但它和高中最大的不同在於：我終於能把大部分心力交給力學、數學與物理。那些專業科目不是外在強加給我的任務，而是我願意靠近的世界。於是，過去被高中消磨掉的自信與熱忱，慢慢回來了。",
      en: "University was no less demanding than high school. There were more assignments, harder examinations, and higher expectations. The crucial difference was that at last I could devote most of myself to mechanics, mathematics, and physics. These professional subjects were not tasks imposed from without, but a world I wished to approach. Little by little, the confidence and devotion that high school had worn away began to return.",
    },
    {
      kind: "paragraph",
      zh: "我在大學維持了很好的成績，但真正支撐我的並不只是分數。分數只是結果，底層的力量是好奇。我讀書時最在乎的，不是老師說哪裡會考，而是心裡有沒有疑惑尚未消除。只要一個觀念還說不通，我就會一直追到能說服自己為止。對我而言，學習不是把考試範圍塞進腦袋，而是讓世界在心裡形成一套清楚、穩固、彼此呼應的結構。",
      en: "I maintained excellent grades in university, but grades alone were never what sustained me. They were the consequence; curiosity was the force beneath them. When I studied, what mattered most was not which material the professor said would be tested, but whether any doubt remained unresolved within me. As long as a concept still failed to make sense, I pursued it until I could persuade myself. To me, learning is not the act of packing an examination syllabus into the mind. It is allowing the world to take shape within it as a clear, stable, and mutually resonant structure.",
    },
    {
      kind: "paragraph",
      zh: "我也逐漸相信，真正的學習不只是把眼前的考試完成，而是讓知識變成會跟著自己走的底蘊。許多延伸內容也許不會立刻反映在分數上，卻會在某一天回過頭來，成為判斷問題、理解世界的力量。比起追逐分數，我更想追求卓越；而我相信，長期追求卓越的人，終究會被實力認出來。",
      en: "I also came to believe that genuine learning is not merely finishing the examination in front of us, but turning knowledge into a foundation that travels with us. Much of what lies beyond the syllabus may not appear immediately in a grade, yet one day it may return as the power to judge a problem and understand the world. More than chasing marks, I want to pursue excellence; and I believe that those who pursue excellence over time will, in the end, be recognized by the substance of what they can do.",
    },
    {
      kind: "paragraph",
      zh: "也因此，教學逐漸成為我大學生活裡很重要的一部分。我喜歡替同學複習、預習，喜歡把複雜觀念整理成能被理解的脈絡。為了教人，我必須先把自己腦中的知識重新拆開、排序、組裝；為了回答同學的問題，我也常常發現原本沒注意到的盲點。教學不是單向輸出，而像一次又一次更嚴格的自我檢查。",
      en: "For that reason, teaching gradually became an important part of my university life. I enjoy helping classmates review material and prepare ahead, and arranging difficult ideas into a sequence another person can understand. To teach, I must first take apart, reorder, and reassemble the knowledge in my own mind; in answering my classmates’ questions, I often discover blind spots I had never noticed. Teaching is not a one-way transmission. It is a more exacting examination of myself, repeated again and again.",
    },
    {
      kind: "paragraph",
      zh: "我的筆記也因此越寫越像講義。起初只是為了自己複習方便，後來卻逐漸變成一種知識整理的工程：把容易混淆的地方標出來，把一般規則與特殊情況連起來，把一個定理、一個公式、一個物理圖像放在同一張地圖上。這個過程讓我更深刻體會到理工知識的美：它可以一般化，也可以特殊化；可以從局部看整體，也可以從整體回到局部。協變性、對稱性、可推廣性，不只是課本裡的詞，而是知識本身令人著迷的秩序。",
      en: "My notes, in turn, began to resemble carefully developed lecture notes. They started simply as a convenient means of review, but gradually became an engineering project in the organization of knowledge: marking what is easily confused, joining general rules to exceptional cases, placing a theorem, a formula, and a physical picture upon the same map. Through this process, I came to feel more deeply the beauty of knowledge in science and engineering: it can be generalized and particularized; it can reveal the whole through the local, and return from the whole to the local. Covariance, symmetry, and generalizability are not merely words in a textbook, but the enthralling order inherent in knowledge itself.",
    },
    {
      kind: "paragraph",
      zh: "我希望這份感受不只停在自己身上。學物理、數學與力學，不該只是為了考試與出路；它們本來就能讓人理解世界。若有人原本只是因為分數進到這個領域，卻在某個觀念被說通的瞬間，稍微感覺到它的美，那麼我花時間教學、寫筆記、整理講義，就有了更深的意義。",
      en: "I hope this feeling does not end with me. Physics, mathematics, and mechanics should not be studied only for examinations or careers; by their nature, they allow us to understand the world. If someone who entered this field merely because of a score can, in the instant a concept finally becomes clear, feel even a little of its beauty, then the time I spend teaching, writing notes, and organizing lessons acquires a deeper meaning.",
    },
    {
      kind: "section",
      zh: "五、定錨：機械工程與時代給我的位置",
      en: "V. Finding My Anchor: Mechanical Engineering and the Place My Time Has Given Me",
    },
    {
      kind: "paragraph",
      zh: "念了一年土木之後，我更確定自己的興趣主要集中在力學、物理與數學。我並不討厭土木，但不想把自己侷限在單一工程領域裡。於是，我申請轉系、雙主修與輔系。心中當然仍有轉往電機的想像；那畢竟是台灣最熱門、也最符合世俗期待的理工科系之一。為了保留更多可能，我也申請了機械工程雙主修，以及從小以來一直放在心上的數學輔系。",
      en: "After a year in civil engineering, I became more certain that my interests centered chiefly on mechanics, physics, and mathematics. I did not dislike civil engineering, but I did not want to confine myself to a single branch of engineering. So I applied to transfer departments, pursue a double major, and add a minor. I still imagined, of course, transferring into electrical engineering; it was, after all, among Taiwan’s most popular technical fields and among those most aligned with conventional expectations. To preserve other possibilities, I also applied for a double major in mechanical engineering and for the mathematics minor I had carried in my heart since childhood.",
    },
    {
      kind: "paragraph",
      zh: "結果是：轉電機失敗，機械雙主修通過，數學輔系也通過。",
      en: "The result was this: my transfer to electrical engineering was rejected; my double major in mechanical engineering was approved; and so was my minor in mathematics.",
    },
    {
      kind: "paragraph",
      zh: "於是，我成為一個同時站在土木、機械與數學之間的學生；也正因如此，我開始更清楚看見自己真正想靠近的核心，其實一直是力學、物理建模與數學結構。",
      en: "I thus became a student standing simultaneously among civil engineering, mechanical engineering, and mathematics. Precisely because of this, I began to see more clearly that the core I had always wished to approach was mechanics, physical modeling, and mathematical structure.",
    },
    {
      kind: "paragraph",
      zh: "那時的我當然有失落，但並沒有把它完全視為不公。我更願意把它看成一種因果。高中三年欠下的東西，不可能靠大一一年的努力就全部補回來；走過的路會留下痕跡，少走的路也會留下空白。這個失敗提醒我，自己還有很大的努力空間，也不該因為大學一開始的順利就重新自滿。",
      en: "I was disappointed, of course, but I did not regard the outcome as wholly unjust. I preferred to understand it as cause and consequence. The debt accumulated across three years of high school could not all be repaid by a single year of effort in university; the roads we travel leave their traces, and the roads we neglect leave their blanks. This rejection reminded me how much room I still had to grow, and that an auspicious beginning in university was no reason to become complacent again.",
    },
    {
      kind: "paragraph",
      zh: "可是多年後回頭看，這次失敗也許正是人生裡一個重要的偶然。它沒有把我帶到當時最想去的地方，卻把我推向後來最適合我的地方。雙主修機械工程之後，我逐漸發現：機械工程是我這輩子學過最有趣，也最能讓我感到內心融洽的領域。",
      en: "Yet looking back years later, this failure may have been an important stroke of chance in my life. It did not take me where I most wanted to go at the time, but it carried me toward the place that would ultimately suit me best. After beginning my double major, I gradually discovered that mechanical engineering was the most fascinating field I had ever studied—and the one in which I felt most inwardly at peace.",
    },
    {
      kind: "paragraph",
      zh: "機械工程有一種很直接的魅力。機構像小時候的玩具，齒輪、連桿、軸承與支架，彼此咬合，彼此牽動，藏著設計者的巧思；熱流把人帶向飛機、航太、能源與更遼闊的天空；控制讓冰冷的機械有了反應與判斷；機器人則把力學、電路、程式、感測與機電整合放在同一個身體裡。它不是單一學科，而是一座把許多知識接在一起的橋。對我而言，最迷人的正是這種交會：用物理建模與力學分析理解真實世界，再把理解推向能運作的系統。",
      en: "Mechanical engineering possesses an immediate kind of charm. Mechanisms resemble the toys of childhood: gears, linkages, bearings, and supports mesh and move one another, each concealing the ingenuity of its designer. Thermofluids lead toward aircraft, aerospace, energy, and wider skies. Control gives cold machinery the power to respond and decide. Robotics places mechanics, circuits, code, sensing, and mechatronic integration within a single body. Mechanical engineering is not one isolated discipline, but a bridge joining many forms of knowledge. For me, that confluence is precisely what makes it irresistible: to understand the real world through physical modeling and mechanical analysis, then carry that understanding into a system that works.",
    },
    {
      kind: "paragraph",
      zh: "我尤其珍惜它給我的回饋感。數學與理論很美，但有時美在遠處；機械工程卻常常把美推到眼前。你設計一個機構，它會轉；你推導一個模型，它能預測；你調整一段控制邏輯，機器的動作就改變。抽象的公式不再只停留在紙上，而會變成螺絲、馬達、電流、震動與軌跡。對我這種既迷戀理論、又渴望看見實體運作的人來說，這幾乎是最理想的位置。",
      en: "I especially treasure the immediacy of the feedback it gives me. Mathematics and theory are beautiful, but sometimes their beauty remains at a distance; mechanical engineering so often brings that beauty directly before the eyes. Design a mechanism, and it turns. Derive a model, and it predicts. Refine a piece of control logic, and the machine moves differently. Abstract equations no longer remain on paper; they become screws, motors, current, vibration, and trajectories. For someone like me—enchanted by theory, yet longing to see tangible things work—this is very nearly the ideal place to stand.",
    },
    {
      kind: "paragraph",
      zh: "也是在這裡，我走向系統控制、機電整合與機器人。無數個深夜，我和同學在實驗室裡看著機器動起來。地上有膠帶標記，桌上散著螺絲、線材與工具，螢幕裡是還沒完全收斂的曲線，空氣裡有馬達發熱後淡淡的氣味。當機器人終於依照預期前進，大家先是安靜一秒，像是不敢相信；接著才一起歡呼。那不是單純完成作業的快樂，而是理論與現實終於握手的瞬間。",
      en: "It was here, too, that I found my way into systems control, mechatronic integration, and robotics. On countless late nights, my classmates and I watched machines come to life in the laboratory. Tape marks crossed the floor; screws, wires, and tools lay scattered across the tables; curves not yet fully converged glowed on the screens; and the air carried the faint scent of motors grown warm. When the robot finally moved as expected, everyone fell silent for a second, as though afraid to believe it. Then we cheered together. It was not merely the pleasure of completing an assignment, but the moment theory and reality finally shook hands.",
    },
    {
      kind: "paragraph",
      zh: "那一刻，我非常確定：自己來到了對的地方。喜歡力學，喜歡數學，喜歡機構像玩具般精巧的設計，也對熱流、航太、控制與機器人都有熱情；把這些線索放在一起，機械工程幾乎不是某個勉強的選擇，而是一路必然與偶然交會後，替我浮現出的答案。",
      en: "In that moment, I was utterly certain: I had arrived at the right place. I loved mechanics and mathematics; I loved the toy-like intricacy of mechanisms; and I felt an ardor for thermofluids, aerospace, control, and robotics. Taken together, these clues made mechanical engineering not a compromise, but the answer that had emerged for me where necessity and chance met along the road.",
    },
    {
      kind: "paragraph",
      zh: "更幸運的是，我趕上了 robotics 與 AI 快速發展的時代。身為機器人實驗室的學生，我能清楚感受到這股浪潮正在推動世界。過去我曾懷疑，機械系學生整天學理論、學力學、學物理建模，是否真的足以做出完整的實體系統。程式、電路、嵌入式、繁瑣的工程整合，曾經都像一道道門檻。",
      en: "More fortunately still, I have come of age in an era of rapid advances in robotics and AI. As a student in a robotics laboratory, I can feel with clarity how this wave is moving the world. I once wondered whether mechanical engineering students, immersed each day in theory, mechanics, and physical modeling, could truly build complete physical systems. Programming, circuits, embedded systems, and the intricacies of engineering integration all once seemed like threshold after threshold.",
    },
    {
      kind: "paragraph",
      zh: "但 AI 的出現，讓這些門檻開始改變。它不能替人理解物理世界，卻能協助處理許多程式語法、工具操作與繁瑣流程。當一個人有清楚的邏輯、模型與目標，AI 可以幫助他更快把想法做成雛形。這反而凸顯了機械系真正珍貴的核心：物理建模、力學判斷、對真實世界限制的理解。AI 可以補齊語法，卻不能替你知道為什麼機器人會摔倒；可以產生程式，卻不能替你判斷摩擦、慣量、剛性、回授延遲與能量損失如何交織成一個動作。",
      en: "The arrival of AI, however, has begun to alter those thresholds. It cannot understand the physical world on our behalf, but it can help with programming syntax, tool operation, and many laborious processes. When someone possesses clear logic, a sound model, and a definite goal, AI can help turn an idea into a prototype more quickly. This, in turn, throws the true core of mechanical engineering into sharper relief: physical modeling, mechanical judgment, and an understanding of real-world constraints. AI can complete syntax, but it cannot know for you why a robot falls. It can generate code, but it cannot judge for you how friction, inertia, stiffness, feedback delay, and energy loss intertwine to produce a motion.",
    },
    {
      kind: "paragraph",
      zh: "因此，我感謝這個時代。它讓具備物理直覺與工程底蘊的人，有機會更快跨過實作門檻，把腦中的模型推向現實。對我而言，這不只是產業潮流，而像一場新的工業革命。若未來機器人能改善人類生活，而我能在其中用自己的學術訓練與工程實作貢獻一點力量，那會是極其值得投入的一生。",
      en: "For this reason, I am grateful to live in this time. It gives those with physical intuition and an engineering foundation the chance to cross the threshold of implementation more quickly and carry the models in their minds into reality. To me, this is not merely an industry trend, but something like a new industrial revolution. If robots can improve human life in the future, and if I can make even a modest contribution through my academic training and engineering practice, that would be a life profoundly worth devoting myself to.",
    },
    {
      kind: "section",
      zh: "六、總結：自洽比前途重要",
      en: "VI. Conclusion: Inner Coherence Matters More Than Prospects",
    },
    {
      kind: "paragraph",
      zh: "當然，我不是不知道現實。若只看台灣產業的薪資與熱門程度，機械工程未必比電機、資工亮眼。許多人會擔心前途，這種擔心並不庸俗；人必須生活，也必須面對市場。只是，若把前途看成唯一座標，人很容易走到一個外表漂亮、內心卻無法安放自己的地方。",
      en: "Of course, I am not blind to reality. Judged solely by salaries and popularity in Taiwanese industry, mechanical engineering may not shine as brightly as electrical engineering or computer science. Many people worry about their prospects, and that worry is not vulgar; one must live, and one must face the market. Yet when prospects become the only coordinate, it is easy to arrive somewhere beautiful in appearance where the inner self cannot rest.",
    },
    {
      kind: "paragraph",
      zh: "我見過一些人，履歷上的選擇幾乎都很正確：熱門科系、漂亮頭銜、看似穩妥的出路。可是他們每天都需要花很大力氣說服自己留下來。讀得痛苦，做得疲憊，卻又因為名聲、薪水或旁人期待而不敢放手。那種生活不是單純辛苦，而是內耗。人一邊往前走，一邊在心裡消耗自己；久了，連原本的聰明與能力都會被磨鈍。",
      en: "I have met people whose résumés appear to contain almost nothing but correct choices: a fashionable major, distinguished titles, a seemingly secure path. Yet every day they must expend enormous effort persuading themselves to remain. Their studies bring pain, their work exhaustion, but reputation, salary, or the expectations of others keep them from letting go. Such a life is not merely difficult; it is a life of inward attrition. A person moves forward while consuming themselves from within, until even their native intelligence and ability are worn blunt.",
    },
    {
      kind: "paragraph",
      zh: "我不想那樣活。對我而言，一個人若能每天真心感覺到：我正在做適合自己的事，我的能力、熱情與價值感在同一個方向上，那份踏實本身就是非常珍貴的答案。這不代表人生從此輕鬆，也不代表所選道路必然帶來世俗意義上的成功；它只是讓人有力氣承受困難。因為辛苦時，你知道自己為何辛苦。失敗時，你知道自己為何還要再試一次。",
      en: "I do not want to live that way. To me, if a person can honestly feel each day that they are doing what suits them—that their ability, passion, and sense of value all point in the same direction—then that groundedness is itself a precious answer. It does not mean life will henceforth be easy, nor that the chosen road will necessarily bring success in the worldly sense. It simply gives a person the strength to bear difficulty. When the work is hard, you know why you endure it. When you fail, you know why you must try once more.",
    },
    {
      kind: "paragraph",
      zh: "這也是我所理解的自洽。它不是自我安慰，也不是逃避競爭；它更像內心結構的穩定。當一個人知道自己為什麼在這裡，也知道自己願意為什麼付出，他就比較不容易被外在排名與潮流搖晃。與其在不適合的熱門道路上耗盡自己，不如在真正契合的領域裡，把能力磨到足夠深、足夠亮。",
      en: "This is what I understand by inner coherence. It is neither self-consolation nor an escape from competition; it is closer to the stability of an inner structure. When a person knows why they are here and what they are willing to work and sacrifice for, external rankings and fashions have less power to shake them. Rather than exhaust oneself on a celebrated road that does not fit, it is better to remain in a field of genuine accord and hone one’s ability until it is deep enough, bright enough.",
    },
    {
      kind: "paragraph",
      zh: "我也相信，所謂前途不只是選到最熱門的入口，而是能否在某個領域裡長久投入、磨到足夠深。各行各業真正走到前段的人，靠的往往不只是努力，而是熱忱、適合與問心無愧的持續性。",
      en: "I also believe that a future is not merely a matter of entering through the most popular gate, but of whether one can remain devoted to a field long enough to reach genuine depth. Those who truly advance to the forefront of any profession often depend on more than effort alone: they depend on passion, fit, and the ability to persist with a clear conscience.",
    },
    {
      kind: "paragraph",
      zh: "回頭看，我的人生並不是一路直線。小時候，我在數學裡得到最早的方向；高中時，我在過度自由裡失去重心；大學後，我重新把人生接回自己手裡；而機械工程，則在必然與偶然交會之處，成為我最清楚的落點。那些繞路、失敗與遺憾，並沒有白白發生。它們有的教我謙卑，有的教我負責，有的把我推向我原本沒看見、後來卻無比感謝的位置。",
      en: "Looking back, my life has never followed a straight line. In childhood, mathematics gave me my earliest direction. In high school, excessive freedom cost me my center. At university, I took my life back into my own hands. And where necessity met chance, mechanical engineering became the clearest place for me to land. None of those detours, failures, or regrets happened in vain. Some taught me humility; some taught me responsibility; and some carried me toward places I had not seen before, but for which I would later feel immeasurably grateful.",
    },
    {
      kind: "paragraph",
      zh: "如今走到大四，我感到踏實，並不是因為自己已經完美，而是因為我知道這幾年沒有白走。我不只是把學分修完，也盡力讓每一門學問在心裡彼此接上。比起高中時表面熱鬧、內心空虛的狀態，大學四年讓我真切感覺到，自己一天一天變得更厚實，也更接近那個能問心無愧理解世界的人。",
      en: "Now, in my senior year, I feel grounded not because I have become perfect, but because I know these years have not been wasted. I have done more than complete my credits; I have tried to let every body of knowledge connect with every other within me. Compared with the outward bustle and inward emptiness of high school, four years at university have allowed me to feel, in a way that is unmistakably real, that I am becoming more substantial day by day—and drawing closer to the person who can seek to understand the world with a clear conscience.",
    },
    {
      kind: "paragraph",
      zh: "如今的我仍有許多不足，也仍要繼續學習。未來，我希望以學術研究為根基，也以工程實作回應世界；在知識的推進中盡一份力，也讓機器人與工程技術真正改善人的生活。我不敢說自己一定能留下多大的痕跡，但我願意踏實走每一步。因為我相信，踏實走過的路，終究會在身上留下力量。",
      en: "I still have many shortcomings, and much yet to learn. In the future, I hope to ground myself in academic research while answering the world through engineering practice: to contribute to the advancement of knowledge, and to help robotics and engineering technology genuinely improve human lives. I would not presume to say how large a mark I will leave, but I am willing to walk each step with care. I believe that a road walked earnestly will, in the end, leave strength within the person who walked it.",
    },
    {
      kind: "paragraph",
      zh: "我希望未來的自己，仍能在越來越複雜的世界裡保留一點赤子之心：保持熱忱，也保持謙遜；保持往前衝的傻勁，也保持願意被問題修正的清醒。",
      en: "I hope that my future self can preserve something of a child’s unguarded heart in an ever more complicated world: to remain passionate, yet humble; to retain the foolish courage to charge forward, yet also the clarity—and willingness—to let problems correct me.",
    },
    {
      kind: "paragraph",
      zh: "如果有一天，我又在深夜的實驗室裡，看見某個機器因為一行程式、一組參數、一段推導而終於動起來，我大概仍會想起小五那年解開題目的自己。那時候的我還不懂人生，只知道一件事被想通時，心裡會亮一下。走到現在，我仍然想守住那一點光。只要我還願意在問題面前停下來，問一句「為什麼」，再一步一步把答案做出來，我就知道，自己沒有走丟。",
      en: "If, one day, I am again in a laboratory late at night and see a machine finally begin to move because of a line of code, a set of parameters, or a derivation, I suspect I will still remember the fifth-grade child who solved that problem long ago. I understood nothing of life then. I knew only that when something was finally understood, a small light came on inside me. Even now, I want to protect that light. As long as I am still willing to stop before a problem and ask, ‘Why?’—then build the answer, step by step—I will know that I have not lost my way.",
    },
  ] as const).map((paragraph, index) => ({
    sourceIndex: index + 1,
    ...paragraph,
  })) satisfies readonly LiteraryAutobiographyParagraph[],
} as const;
