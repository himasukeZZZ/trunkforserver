const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

// アップロードする画像ファイルのパス（必ず 'latest.jpg' に設定）
const imagePath = path.join(__dirname, 'public', 'latest.jpg');

// 画像をアップロードする関数
async function uploadImage() {
    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));

    try {
        const response = await axios.post('http://your-server-url/upload', form, {
            headers: form.getHeaders(),
        });
        console.log('Image uploaded successfully:', response.data);
    } catch (error) {
        console.error('Error uploading image:', error);
    }
}

// 画像アップロードを実行
uploadImage();

