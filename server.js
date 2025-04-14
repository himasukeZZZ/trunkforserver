const express = require('express');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const multer = require('multer');
const stream = require('stream');

// Google Cloud Storageの設定
const storage = new Storage({
  keyFilename: path.join(__dirname, 'your-service-account-file.json')  // サービスアカウントのJSONファイルのパスを指定
});
const bucketName = 'trunk-beer-coffee-menu.appspot.com';
const bucket = storage.bucket(bucketName);

// Expressアプリケーションの設定
const app = express();
const PORT = process.env.PORT || 3000;

// 静的ファイル（HTML、CSS、JS）を提供
app.use(express.static(path.join(__dirname, 'public')));  // 'public'ディレクトリの中のファイルを提供

// ルートURLにアクセスしたときの処理
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));  // 'index.html'を表示
});

// multer設定 (ファイルを一時保存する場所)
const upload = multer();

// 画像アップロード用エンドポイント
app.post('/upload', upload.fields([{ name: 'latestImage' }, { name: 'filterImage' }]), (req, res) => {
  // それぞれの画像をGoogle Cloud Storageにアップロード

  // 最新画像 (latest.jpg)
  if (req.files.latestImage) {
    const latestImageFile = req.files.latestImage[0];
    const latestFile = bucket.file('latest.jpg');
    const latestWriteStream = latestFile.createWriteStream({
      resumable: false,
      contentType: latestImageFile.mimetype,
    });

    stream.Readable.from(latestImageFile.buffer).pipe(latestWriteStream);

    latestWriteStream.on('finish', () => {
      console.log('latest.jpg uploaded successfully!');
    });
  }

  // フィルター画像 (filter.jpg)
  if (req.files.filterImage) {
    const filterImageFile = req.files.filterImage[0];
    const filterFile = bucket.file('filter.jpg');
    const filterWriteStream = filterFile.createWriteStream({
      resumable: false,
      contentType: filterImageFile.mimetype,
    });

    stream.Readable.from(filterImageFile.buffer).pipe(filterWriteStream);

    filterWriteStream.on('finish', () => {
      console.log('filter.jpg uploaded successfully!');
      res.status(200).send('画像アップロード完了！');
    });
  }
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
