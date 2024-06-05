const path = require("path");
const sharp = require("sharp");

async function imageProcessService(job) {
    const { image } = job;
    const imageName = path.parse(image.name).name;
    const imageFileData = Buffer.from(image.data, "base64");
    console.log('started service')
    const processImage = async (size) => {
        await sharp(imageFileData)
            .resize(size, size)
            .webp({ lossless: true })
            .toFile(`../../public/images/${imageName}-${size}.webp`)
    };

    const sizes = [90, 96, 120, 144, 160, 180, 240, 288, 360, 480, 720, 1440];
    await Promise.all(sizes.map(processImage));
}

module.exports = { imageProcessService };
