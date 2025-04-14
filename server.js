const express = require('express');
const path = require('path');
const multer = require('multer');
const admin = require('firebase-admin');
const stream = require('stream');

// Firebase Admin SDKの初期化
admin.initializeApp({
  credential: admin.credential.cert(path.join(__dirname, 'your-service-account-file.json')),  // サービスアカウントJSONファイルのパス
  storageBucket: 'trunk-beer-coffee-menu.appspot.com',  // Firebase Storageのバケット名
});

const bucket = admin.storage().bucket();
const app = express();
const PORT = process.env.PORT || 3000;

// multer設定 (ファイルを一時保存する場所)
const upload = multer();

// 画像アップロード用エンドポイント
app.post('/upload', upload.fields([{ name: 'latestImage' }, { name: 'filterImage' }]), (req, res) => {
  if (!req.files || !req.files.latestImage || !req.files.filterImage) {
    return res.status(400).send('Both images (latest and filter) are required');
  }

  // 最新画像 (latest.jpg)
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

  latestWriteStream.on('error', (err) => {
    console.error('Error uploading latest.jpg:', err);
    return res.status(500).send('Error uploading latest.jpg');
  });

  // フィルター画像 (filter.jpg)
  const filterImageFile = req.files.filterImage[0];
  const filterFile = bucket.file('filter.jpg');
  const filterWriteStream = filterFile.createWriteStream({
    resumable: false,
    contentType: filterImageFile.mimetype,
  });

  stream.Readable.from(filterImageFile.buffer).pipe(filterWriteStream);

  filterWriteStream.on('finish', () => {
    console.log('filter.jpg uploaded successfully!');
    return res.status(200).send('Both images uploaded successfully!');
  });

  filterWriteStream.on('error', (err) => {
    console.error('Error uploading filter.jpg:', err);
    return res.status(500).send('Error uploading filter.jpg');
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
