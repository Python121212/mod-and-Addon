async function processMod() {
    const fileInput = document.getElementById('modFile');
    const output = document.getElementById('output');
    const status = document.getElementById('status');

    // 初期化
    output.innerText = "";
    if (!fileInput.files[0]) {
        status.innerText = "❌ ファイルを選択してください";
        return;
    }

    try {
        status.innerText = "⏳ 解析中...";
        const zip = await JSZip.loadAsync(fileInput.files[0]);
        
        // ファイルリストを確認（デバッグ用）
        console.log("FILES:", Object.keys(zip.files));

        // mods.toml を探す (大文字小文字を区別しない工夫)
        const tomlFile = zip.file(/mods\.toml$/i)[0]; 
        
        if (!tomlFile) {
            throw new Error("mods.toml が見つかりません。1.13以降のForge MODですか？");
        }

        const tomlText = await tomlFile.async("string");
        
        // 正規表現の強化
        const modId = tomlText.match(/modId\s*=\s*["']([^"']+)["']/)?.[1] || "unknown_id";
        const displayName = tomlText.match(/displayName\s*=\s*["']([^"']+)["']/)?.[1] || "Unknown Mod";

        const manifest = {
            "format_version": 2,
            "header": {
                "name": displayName,
                "description": `Converted: ${modId}`,
                "uuid": crypto.randomUUID(),
                "version": [1, 0, 0],
                "min_engine_version": [1, 20, 0]
            },
            "modules": [{ "type": "resources", "uuid": crypto.randomUUID(), "version": [1, 0, 0] }]
        };

        status.innerText = "✅ 解析完了！";
        output.innerText = JSON.stringify(manifest, null, 4);

    } catch (err) {
        status.innerText = "❌ エラー発生";
        output.innerText = err.message;
        console.error(err);
    }
}
