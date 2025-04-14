const express = require('express');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const stream = require('stream');

// Google Cloud Storageの認証情報を設定
const storage = new Storage({
    keyFilename: path.join(__dirname, 'your-service-account-file.json')  // サービスアカウントのJSONファイルのパスを指定
});

// Google Cloud Storageのバケット名
const bucketName = 'trunk-beer-coffee-menu.appspot.com';
const bucket = storage.bucket(bucketName);

const app = express();
const PORT = process.env.PORT || 3000;

// アップロード処理
app.post('/upload', (req, res) => {
    const passThrough = new stream.PassThrough();
    
    // リクエストボディから画像データを受け取る
    req.pipe(passThrough);

    // 最初の画像 (latest.jpg) をアップロード
    const latestFileName = `latest.jpg`;
    const latestFile = bucket.file(latestFileName);
    const latestWriteStream = latestFile.createWriteStream({
        resumable: false,
        contentType: req.headers['content-type'],
    });

    // 2番目の画像 (filter.jpg) をアップロード
    const filterFileName = `filter.jpg`;
    const filterFile = bucket.file(filterFileName);
    const filterWriteStream = filterFile.createWriteStream({
        resumable: false,
        contentType: req.headers['content-type'],
    });

    // リクエストデータを両方のストリームにパイプ
    passThrough.pipe(latestWriteStream);
    passThrough.pipe(filterWriteStream);

    // 両方のアップロードが完了したときの処理
    latestWriteStream.on('finish', () => {
        console.log('latest.jpg uploaded successfully!');
    });

    filterWriteStream.on('finish', () => {
        console.log('filter.jpg uploaded successfully!');
        res.status(200).send('画像アップロード完了！');
    });

    // エラーハンドリング
    latestWriteStream.on('error', (err) => {
        console.error('Error uploading latest.jpg:', err);
        res.status(500).send('アップロードに失敗しました');
    });

    filterWriteStream.on('error', (err) => {
        console.error('Error uploading filter.jpg:', err);
        res.status(500).send('アップロードに失敗しました');
    });
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

