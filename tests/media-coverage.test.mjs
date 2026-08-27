import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const projectRoot = process.cwd();
const publicRoot = join(projectRoot, "public");

function allFiles(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    return entry.isDirectory() ? allFiles(path) : [path];
  });
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex").toUpperCase();
}

function publicPath(path) {
  return `/${path.slice(publicRoot.length + 1).replaceAll("\\", "/")}`;
}

test("images on the same page have distinct bilingual labels", () => {
  const manifest = JSON.parse(readFileSync(join(projectRoot, "lib", "media-manifest.json"), "utf8"));
  const images = manifest.filter((asset) => asset.kind === "image");

  for (const field of ["titleEn", "titleZh", "altEn", "altZh"]) {
    const seen = new Map();
    for (const image of images) {
      const key = `${image.route}\u0000${image[field]}`;
      assert.equal(
        seen.has(key),
        false,
        `Duplicate ${field} on ${image.route}: ${image[field]} (${seen.get(key)}, ${image.id})`,
      );
      seen.set(key, image.id);
    }
  }
});

test("public media titles are reviewed, specific, and typographically natural", () => {
  const manifest = JSON.parse(readFileSync(join(projectRoot, "lib", "media-manifest.json"), "utf8"));
  const images = manifest.filter((asset) => asset.kind === "image");

  for (const asset of manifest) {
    for (const value of [asset.titleEn, asset.altEn, asset.captionEn]) {
      assert.doesNotMatch(
        value ?? "",
        /Portfolio evidence for|Chien-Kuo|science-camp|academic-journey|baseball-team|Lead-vocal|result-video|additive-manufacturing|lane-detection|control-system|autonomous-car|NXP x Avnet|Independent Research Presentation -/,
      );
    }
    for (const value of [asset.titleZh, asset.altZh, asset.captionZh]) {
      assert.doesNotMatch(value ?? "", /TRML 2021(?=[\p{Script=Han}])|Jarvis(?=[\p{Script=Han}])|(?<=[\p{Script=Han}])Simulink/gu);
    }
  }

  const aboutImages = images.filter((asset) => asset.route === "/about");
  assert.deepEqual(aboutImages.map((asset) => asset.titleZh), ["雪地滑雪留影", "蘭花展留影"]);
  assert.equal(
    images.find((asset) => asset.id === "img-ad7478744553")?.titleZh,
    "建中科研社活動名牌",
  );

  const expectedEnglishTitles = new Map([
    ["doc-jarvis-award", "MakeNTU 2026 NXP × Avnet Smart Living Challenge — First-Place Certificate"],
    ["doc-research-presentation-introduction", "Chien Kuo Independent Research Symposium — Event Information and Registration Packet"],
    ["doc-research-presentation-poster", "Chien Kuo Independent Research Symposium — Promotional Poster"],
    ["doc-geometry-science-fair-honor", "Chien Kuo High School Mathematics Science Fair — Excellence Award"],
    ["img-2fff62bb7833", "Science Research Club record and classroom mathematics lesson"],
    ["img-b59b554de571", "NTU Spring 2026 Course Results (Academic Year 114-2)"],
  ]);
  for (const [id, expectedTitle] of expectedEnglishTitles) {
    assert.equal(manifest.find((asset) => asset.id === id)?.titleEn, expectedTitle);
  }
});

test("every released media file matches its manifest size and SHA-256", () => {
  const manifest = JSON.parse(readFileSync(join(projectRoot, "lib", "media-manifest.json"), "utf8"));
  const expectedFiles = new Map();
  const register = (record) => {
    if (!record?.publicPath || !record.sha256 || !Number.isInteger(record.byteSize)) return;
    const existing = expectedFiles.get(record.publicPath);
    if (existing) {
      assert.deepEqual(existing, [record.sha256, record.byteSize]);
      return;
    }
    expectedFiles.set(record.publicPath, [record.sha256, record.byteSize]);
  };

  for (const asset of manifest) {
    register(asset);
    for (const variant of Object.values(asset.variants ?? {})) register(variant);
    for (const variant of Object.values(asset.previewVariants ?? {})) register(variant);
  }

  assert.ok(expectedFiles.size >= 300);
  for (const [publicPath, [expectedHash, expectedSize]] of expectedFiles) {
    const filePath = join(publicRoot, publicPath.replace(/^\/+/, ""));
    assert.equal(existsSync(filePath), true, `Missing released media file: ${publicPath}`);
    assert.equal(statSync(filePath).size, expectedSize, `Size mismatch: ${publicPath}`);
    assert.equal(sha256(filePath), expectedHash, `SHA-256 mismatch: ${publicPath}`);
  }
});

test("managed public media directories contain only manifest-listed release files", () => {
  const manifest = JSON.parse(readFileSync(join(projectRoot, "lib", "media-manifest.json"), "utf8"));
  const expected = new Set();
  const register = (record) => {
    if (record?.publicPath) expected.add(record.publicPath);
  };
  for (const asset of manifest) {
    register(asset);
    for (const variant of Object.values(asset.variants ?? {})) register(variant);
    for (const variant of Object.values(asset.previewVariants ?? {})) register(variant);
  }

  const managedDirectories = [
    join(publicRoot, "documents"),
    join(publicRoot, "assets", "images"),
    join(publicRoot, "assets", "pdf-previews"),
  ];
  const actual = new Set(managedDirectories.flatMap(allFiles).map(publicPath));
  assert.deepEqual([...actual].sort(), [...expected].sort());
});

test("all user-authorized general photographs are published with deliberate placement", () => {
  const manifest = JSON.parse(readFileSync(join(projectRoot, "lib", "media-manifest.json"), "utf8"));
  const exceptions = JSON.parse(readFileSync(join(projectRoot, "lib", "media-exceptions.json"), "utf8"));
  const expected = new Map([
    ["C0C29E33D26DDB879BADAE8C86265209F1FA9BFCF72CA84DCE958E42B87F123D", "/experience/jinhua-primary-school"],
    ["4EB15C4B30C01CBE24793A666343956F02D34631354F237B0CB2B11EA218A1FD", "/experience/zhongzheng-junior-high"],
    ["385F443299982B79EE766E8D97AE8A1CFC8316D80CF9952A76DF52A76EEAA162", "/experience/chien-kuo-gifted-class"],
    ["4D3FE5D156FFFF502028120B6626880897A4DB0AACDDA09CC9AFFBD0096E4328", "/experience/chien-kuo-gifted-class"],
    ["D1D281D4DCAA71A8967669A7447CE9C15121A07498224E6294E932BDA2917008", "/experience/chien-kuo-gifted-class"],
    ["FDD30DDCD8E51E0300C569DC41465D8B91E4988530CCC0B1F7018AD82A69F049", "/experience/chien-kuo-gifted-class"],
    ["9AF476327E7F8CE1282B7FBF84EFBD19E33AEBBA2DC6EE39633C4310BD1034B6", "/experience/qingshui-science-outreach"],
    ["A8D93CDE56C83BEB1EC8FB12BBF2AB07A0A44E85263E5C77CDA82CED19370B44", "/experience/qingshui-science-outreach"],
    ["3F260D7C91DD2A8E24412AB05A1FEF766E1C3FAC39BDB9BDDDBC5EB38CEF428D", "/experience/zhongshan-primary-science-camp"],
    ["7513399307403507387D172289F5E395A1483F0F15946C7FE95A0E00DD977286", "/experience/zhongshan-primary-science-camp"],
    ["22B9623082793A2BA8181DA943DBD86AE2A1E7F05EDC1820BB5EFD5126DC242A", "/experience/renai-junior-high-science-camp"],
    ["4C98134FC2CA775C9555181A90EBAFF46F88A289352E635380CCA38211AD00CD", "/experience/renai-junior-high-science-camp"],
    ["6FCCEEDF2E3047817638948C81BCC74516D0748398D7D5E6FE6ABFD1DBCA2141", "/research/geometry-covering"],
  ]);

  const images = manifest.filter((asset) => asset.kind === "image");
  assert.equal(images.length, 73);
  for (const [sourceSha256, route] of expected) {
    const image = images.find((asset) => asset.sourceSha256 === sourceSha256);
    assert.ok(image, `Missing public derivative for ${sourceSha256.slice(0, 12)}`);
    assert.equal(image.route, route);
    assert.equal(image.status, "public_derivative_metadata_scrubbed");
    assert.equal(image.metadataScrubbed, true);
    assert.ok(image.displayOrder >= 1);
    assert.equal(
      exceptions.some((entry) => entry.id === image.id),
      false,
      `${image.id} must not remain in the withheld-source registry`,
    );
  }

  const qingshui = images.filter((image) => image.route === "/experience/qingshui-science-outreach");
  assert.equal(qingshui.length, 2);
  assert.deepEqual(qingshui.map((image) => image.displayOrder), [1, 2]);
  for (const image of qingshui) {
    assert.equal(image.width, 1920, "HEIC must decode as the complete portrait, not a 512px tile");
    assert.equal(image.height, 2560, "HEIC must decode as the complete portrait, not a 512px tile");
  }

  const orderedNotebookSets = new Map([
    ["/academics/engineering-mathematics", ["img-99f1a81631d2", "img-8786d36e5762", "img-4820678e0289"]],
    ["/academics/coursework/fluid-mechanics", ["img-91ee85da4cec", "img-d744882f84be", "img-7acc621fca6f"]],
  ]);
  for (const [route, expectedIds] of orderedNotebookSets) {
    assert.deepEqual(
      images.filter((image) => image.route === route).map((image) => image.id),
      expectedIds,
      `Notebook figures must retain their I–II–III reading order on ${route}`,
    );
  }
});

test("all 12 YouTube videos use local, real, three-format posters", () => {
  const videosSource = readFileSync(join(projectRoot, "lib", "videos.ts"), "utf8");
  const recordIds = [...videosSource.matchAll(/^ {4}id: "([\w-]{11})",$/gm)].map((match) => match[1]);
  const posterIds = [...videosSource.matchAll(/poster: localPoster\("([\w-]{11})"\)/g)].map((match) => match[1]);
  const uploadDates = [...videosSource.matchAll(/uploadDate: "([^"]+)"/g)].map((match) => match[1]);

  assert.equal(recordIds.length, 12);
  assert.deepEqual(new Set(posterIds), new Set(recordIds));
  assert.equal(uploadDates.length, recordIds.length);
  assert.equal(uploadDates.every((value) => !Number.isNaN(Date.parse(value))), true);
  assert.doesNotMatch(videosSource, /i\.ytimg\.com|img\.youtube\.com/i);

  for (const id of recordIds) {
    for (const extension of ["avif", "webp", "jpg"]) {
      const path = join(publicRoot, "assets", "video-posters", `${id}.${extension}`);
      assert.equal(existsSync(path), true, `Missing ${extension} poster for ${id}`);
      assert.ok(statSync(path).size > 10_000, `Poster is unexpectedly small: ${id}.${extension}`);
    }
  }

  const playerSource = readFileSync(join(projectRoot, "components", "YouTubeEmbed.tsx"), "utf8");
  assert.match(playerSource, /image-set\(/);
  assert.match(playerSource, /youtube-nocookie\.com\/embed/);
  assert.match(playerSource, /type PlayerState = "idle" \| "loading" \| "playing" \| "error"/);
  assert.match(playerSource, /onLoad=\{\(\) => setPlayerState\("playing"\)\}/);
  assert.match(playerSource, /onError=\{\(\) => setPlayerState\("error"\)\}/);
  assert.match(playerSource, /setTimeout\(\(\) => setPlayerState\("error"\), 12_000\)/);
  assert.match(playerSource, /portfolio-video-play/);
});

test("every unique source image is either published or has a precise sensitive-data exception", () => {
  const manifest = JSON.parse(readFileSync(join(projectRoot, "lib", "media-manifest.json"), "utf8"));
  const exceptions = JSON.parse(readFileSync(join(projectRoot, "lib", "media-exceptions.json"), "utf8"));
  const gradeSource = "B59B554DE571588D39C1367CFA64498EE96A83A1C0B0D6FDFA30F09F8779CD38";
  const withheldSources = new Map([
    ["D52BD49AD23B3C88F509911CF716C3B2B4430420BDA9E40B8278710EE9348A2E", "withheld_internal_paths_or_infrastructure_details"],
    ["EC2C26F0967708C5E6BDE2FE74D0AED10775184FB60E224160DC518678BF2AF3", "withheld_internal_paths_or_infrastructure_details"],
    ["335C7400004F4110A91BCAEFB41EAD9EEB57E5679FDFB70788537BCCF41A6671", "withheld_internal_paths_or_infrastructure_details"],
    ["75755CC8C872A6248B43FB85A4731929CD827737ECC8BA85A59DA9317DAC49CB", "withheld_internal_paths_or_infrastructure_details"],
    ["52C39B4A7147AD2B9C450C7C9BB46CCC2A8CC282286B304A3B6C6238752308CA", "withheld_third_party_contact_details"],
    ["BF8EA31854DDE76B5A10347BD6DD272FDF0CAEA28C0CB3A727C2391AD73A34CF", "withheld_third_party_identity_and_email_header"],
    ["EB887DDD2D088B5820DB50B81DA6F6F1100033C4706F3BF64F83385A8BDB26EF", "never_deploy_government_identifier"],
    ["B54B450DCBE6F3D6EA27C8EDCFA669E541EC9BA81201111C1001C3E2B11A1916", "never_deploy_government_identifier"],
  ]);

  const gradeDerivative = manifest.find((asset) => asset.sourceSha256 === gradeSource);
  assert.ok(gradeDerivative, "Missing approved 114-2 grade derivative");
  assert.equal(gradeDerivative.route, "/academics/honors");
  assert.equal(gradeDerivative.status, "public_derivative_metadata_scrubbed_from_withheld_source");
  assert.equal(gradeDerivative.metadataScrubbed, true);
  assert.equal(gradeDerivative.sourceOriginalDeployed, false);

  for (const [sourceSha, reason] of withheldSources) {
    const record = exceptions.find((entry) => entry.sourceSha256 === sourceSha);
    assert.ok(record, `Missing exception for ${sourceSha.slice(0, 12)}`);
    assert.equal(record.reason, reason);
    assert.match(record.disposition, /source_not_deployed|source_original_permanently_excluded/);
    assert.ok(record.safeAlternative);
    assert.equal("sourcePath" in record, false, "Internal source paths must not enter release metadata");
  }

  const forbiddenOriginalHashes = new Set([gradeSource, ...withheldSources.keys()]);
  const publishedSourceHashes = new Set(
    manifest.filter((asset) => asset.kind === "image").map((asset) => asset.sourceSha256),
  );
  assert.equal(publishedSourceHashes.size, 73);
  assert.equal(exceptions.length, 8);
  assert.equal(new Set(exceptions.map((entry) => entry.sourceSha256)).size, 8);
  assert.equal(
    [...withheldSources.keys()].some((hash) => publishedSourceHashes.has(hash)),
    false,
    "Sensitive source originals must not also appear in the public image set",
  );
  assert.equal(new Set([...publishedSourceHashes, ...withheldSources.keys()]).size, 81);
  for (const path of allFiles(publicRoot)) {
    assert.equal(
      forbiddenOriginalHashes.has(sha256(path)),
      false,
      `A withheld original was copied into public storage: ${path}`,
    );
  }
});

test("sensitive and explicitly declined source artifacts never enter public storage", () => {
  const withheld = new Map([
    ["B59B554DE571588D39C1367CFA64498EE96A83A1C0B0D6FDFA30F09F8779CD38", "withheld 114-2 grade screenshot"],
    ["57BB0DC8364FAF13E239C8F27570917B4449D6E7CDF2D113E2AAF8021622F317", "APMO certificate with government identifier"],
    ["1C700148B9E1B5A6AFC19B87B709EF93727D99D3E7A5F66042CFFB49428B64AA", "official NTU transcript"],
    ["A7BDDA3CDD5A47BBB6148D7B5C2DC51ED8E687AED4E6E1BE95791E2770476D93", "NTU enrollment certificate"],
    ["96EB10062C6CA9812F8FA01A0F63B2A17200C843148560831D42CFD1D9E1F8BC", "high-school diploma front"],
    ["823432ECB824FDCCF62AABAD463C88510A2A2CBDCEDF655DEFCD06F4F8056A2A", "high-school diploma back"],
    ["143154B67404FC875A5E59B0AE22774923B43B689C3A9E4C4B99E111DF3AD9D2", "gifted-program certificate in Chinese"],
    ["26949E8200B68F8EC47B2A0753AD07B89945EEE7FBC5BE8FEFC974813E0B9C89", "gifted-program certificate in English"],
    ["CD2F9A0DF3983449C3F7FD464BDC6E1C427FF18C76448DB0205B88BBE642CFF7", "AMC 10A record with address and admission number"],
    ["EB887DDD2D088B5820DB50B81DA6F6F1100033C4706F3BF64F83385A8BDB26EF", "APX certificate with government identifier"],
    ["B54B450DCBE6F3D6EA27C8EDCFA669E541EC9BA81201111C1001C3E2B11A1916", "APX certificate with government identifier"],
    ["8E1E4CC57B5A3E93BEE37352B6BA775757DD06853A99473E5E9CE67A7A14A419", "declined Engineering Graphics course specification"],
    ["B79ADADADC001E2C740B31418A8C0D91E3AC0AEC3C9FED6D9EB1A11CA4046FC0", "declined Inventor course specification"],
    ["E1E0AEE6AD106C4CBABFD58B20B100244F7C9AACCAFE2FCC745328F9EEE3B331", "declined high-school learning-history PDF"],
    ["AC14E59D60916025F23A1224655DDB7A27F82D3A5CEC45925D2637B08A9869C5", "declined high-school activities PDF"],
    ["37CD490742AA15F6B501E7761161DB93087FC2527FA2068258D9D8E1AF977FB8", "declined RedRHex presentation"],
    ["682A24B8998B0907F87D030E278CB68C60D9FD82115A0492E436B3FCE11AC57B", "declined RedRHex presentation"],
    ["6FA98755DA59D301947E840C692C8A941DC8BE5D29D56DA6D8067156C5CA0B95", "declined RedRHex presentation"],
    ["DCAA5EEEDC80FA092630DC11DA5824EFB194C56EAFBB94E378D8A80211B92875", "declined RedRHex presentation"],
    ["581E65BCA0F0B877067A20701BCC4A9A548DB26771126427454708D370861AF6", "declined RedRHex presentation"],
    ["D1D23A4D549E9347C3A2EA059C85E15A7E0202557309FD65F69F56AD594C7B53", "declined RedRHex presentation"],
    ["0AAD6E07E4D7C52BD612E40C46E0E42DA660A24E2FB93EC3E6CC980CA2972A44", "declined RedRHex presentation"],
    ["FCB9ED131067865C74E4EA4EDDB6416108D5D9B77C5CFF3549B9D5300CF456D5", "declined RedRHex presentation"],
    ["B8909FF5F9A9BFC68C054012F01ED2235CF5BA41D7E0BFF3DF72EA20BF0A5A51", "declined RedRHex presentation"],
  ]);

  for (const path of allFiles(publicRoot)) {
    const hash = sha256(path);
    assert.equal(
      withheld.has(hash),
      false,
      `Withheld source artifact entered public storage (${withheld.get(hash)}): ${path}`,
    );
  }

  const manifest = JSON.parse(readFileSync(join(projectRoot, "lib", "media-manifest.json"), "utf8"));
  const releasedSourceHashes = new Set(manifest.map((asset) => asset.sourceSha256).filter(Boolean));
  for (const [sourceSha, label] of withheld) {
    // The 114-2 screenshot is the one intentionally supported source for a
    // separately generated, metadata-free image derivative. Its raw bytes are
    // still forbidden above; all other sensitive/declined binaries must not
    // even be selected as a release input.
    if (sourceSha === "B59B554DE571588D39C1367CFA64498EE96A83A1C0B0D6FDFA30F09F8779CD38") continue;
    assert.equal(
      releasedSourceHashes.has(sourceSha),
      false,
      `Withheld source was used as a release input (${label}): ${sourceSha}`,
    );
  }
});
