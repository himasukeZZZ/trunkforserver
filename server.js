const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const uploadDir = path.join(__dirname, 'uploads');
const uploadPath = path.join(uploadDir, 'latest.jpg');

// アップロードディレクトリがなければ作成
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer設定（常に 'latest.jpg' に保存）
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, 'latest.jpg');
    }
});
const upload = multer({ storage });

// 静的ファイルの提供（画像表示用）
app.use('/uploads', express.static(uploadDir));

// HTMLフォームを表示
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// 画像アップロード処理
app.post('/upload', upload.single('image'), (req, res) => {
    res.send('アップロード完了！');
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
