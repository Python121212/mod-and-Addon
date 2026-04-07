async function processMod() {
    const fileInput = document.getElementById('modFile');
    const output = document.getElementById('output');
    const status = document.getElementById('status');

    if (!fileInput.files[0]) return alert("ファイルを選択してください");

    status.innerText = "解析中...";
    const zip = await JSZip.loadAsync(fileInput.files[0]);
    
    // 1. mods.toml (Java版の名刺) を探す
    const tomlFile = zip.file("META-INF/mods.toml");
    if (!tomlFile) {
        status.innerText = "エラー: mods.tomlが見つかりません (1.13+のMODではありません)";
        return;
    }

    const tomlText = await tomlFile.async("string");
    
    // 2. 簡易的な解析 (本来はTOMLパーサーが必要ですが、実験用に正規表現で抜き出します)
    const modId = tomlText.match(/modId\s*=\s*"([^"]+)"/)?.[1] || "converted_mod";
    const displayName = tomlText.match(/displayName\s*=\s*"([^"]+)"/)?.[1] || "Converted Mod";

    // 3. 統合版用 manifest.json の組み立て
    const manifest = {
        "format_version": 2,
        "header": {
            "name": displayName,
            "description": "Converted from Java Edition via 10-Year Project",
            "uuid": crypto.randomUUID(), // 実験用にランダム生成
            "version": [1, 0, 0],
            "min_engine_version": [1, 20, 0]
        },
        "modules": [
            {
                "type": "resources",
                "uuid": crypto.randomUUID(),
                "version": [1, 0, 0]
            }
        ]
    };

    // 4. 結果を表示
    status.innerText = "解析完了！";
    output.innerText = JSON.stringify(manifest, null, 4);
}
