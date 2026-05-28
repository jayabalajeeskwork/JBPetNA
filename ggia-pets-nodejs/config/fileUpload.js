/* Multer */
require('dotenv').config();
const multer = require("multer");
const multerS3 = require('multer-s3');
const path = require('path');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('./s3.config');
// const UserModel = require("../models/user.model");

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'public/uploads');
    },
    filename: function (req, file, callback) {
        console.log("FILES FROM FILE UPLOAD>>>>>>", file)
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const s3Storage = multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET,
    metadata: function (req, file, cb) {
        cb(null, {
            fieldName: file.fieldname + '-' + Date.now() + path.extname(file.originalname)
        });
    },
    key: async function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({
    limits: {
        fileSize: 100 * 1024 * 1024, // 100 MB upload limit
        // files: 1                    // 1 file
    },
    fileFilter: (req, file, cb) => {
        // if the file extension is in our accepted list
        if (mimeTypes.allowed_file_mimes.some(ext => file.originalname.endsWith("." + ext))) {
            return cb(null, true);
        }
        // otherwise, return error
        return cb(new Error('file not allowed'));
    },

    storage: storage
});

const s3upload = multer({
    limits: {
        fileSize: 100 * 1024 * 1024, // 100 MB upload limit
        // files: 1                    // 1 file
    },
    fileFilter: (req, file, cb) => {
        // if the file extension is in our accepted list
        if (mimeTypes.allowed_image_mimes.some(ext => file.originalname.toLowerCase().endsWith("." + ext))) {
            return cb(null, true);
        }
        else if (mimeTypes.allowed_video_mimes.some(ext => file.originalname.toLowerCase().endsWith("." + ext))) {
            return cb(null, true);
        }
        // otherwise, return error
        return cb(new Error('file not allowed'));
    },
    // storage: storage//storage
    storage: s3Storage //s3
});


const mimeTypes = {
    'allowed_image_mimes': ['jpeg', 'png', 'bmp', 'jpg', 'apk', 'gif', 'svg', 'webp'],
    'allowed_file_mimes': ['xls', 'xlsx', 'csv'],
    'allowed_video_mimes': ['3gp', 'mp4', 'mpeg', 'avi', 'mov', 'wmv', 'mkv', 'flv', 'vob', 'rm', 'rmbv', 'm4p', 'flv', 'f4v', 'f4p', 'f4a', 'f4b', 'ogg', 'qt'],
    // 'allowed_video_mimes': '3gp,mp4,mpeg,avi,mov,wmv,mkv,flv,vob,rm,rmbv,m4p,flv,f4v,f4p,f4a,f4b,ogg,qt',
    // 'allowed_video_image_mimes': 'jpeg,png,bmp,jpg,gif,svg,3gp,mp4,mpeg,avi,mov,wmv,mkv,flv,vob,rm,rmbv,m4p,flv,f4v,f4p,f4a,f4b,ogg,qt',
};

class FileUpload {

    constructor() {
        this.files = this.files.bind(this);
    }
    files(filesArray) {
        try {
            let files = filesArray.map(file => {
                return {
                    name: file,
                    // maxCount: 1
                }
            });
            const uploadable = s3upload.fields(files)
            return (req, res, next) => {
                uploadable(req, res, function (err) {
                    console.log(err, 'Error in fileUpload')
                    req.uploadError = err
                    if (err) {
                        next(err)
                        return
                    }
                    next()
                })
            };
        } catch (e) {
            console.log(e, 'Error at fileUploads')
            return e
        }
    }

    uploadFileInLocal(filesArray) {
        try {
            let files = filesArray.map(file => {
                return {
                    name: file,
                    // maxCount: 1
                }
            });
            const uploadable = upload.fields(files)
            return (req, res, next) => {
                uploadable(req, res, function (err) {
                    console.log(err, 'Error in fileUpload')
                    req.uploadError = err
                    if (err) {
                        next(err)
                        return
                    }
                    next()
                })
            };
        } catch (e) {
            console.log(e, 'Error at fileUploads')
            return e
        }
    }

    async uploadToS3(data, key) {
        try {
            const params = {
                Bucket: process.env.AWS_BUCKET,
                Key: key,
                Body: data,
            };
            console.log(key)
            let uploadData = await s3.send(new PutObjectCommand(params));
            console.log(uploadData, 'uploadData')
            return uploadData;
        }
        catch (e) {
            console.log(e, 'Error at fileUploads')
            return e
        }
    }


    arrayUpload(name) {
        return upload.array(name);
    }

    excelFile(name) {
        const memoryUpload = multer({
            storage: multer.memoryStorage(),
            limits: {
                fileSize: 20 * 1024 * 1024 // 20 MB limit
            },
            fileFilter: (req, file, cb) => {
                if (mimeTypes.allowed_file_mimes.some(ext => file.originalname.toLowerCase().endsWith("." + ext))) {
                    return cb(null, true);
                }
                return cb(new Error('only excel and csv files allowed'));
            }
        });
        return memoryUpload.single(name);
    }

}


module.exports = new FileUpload();