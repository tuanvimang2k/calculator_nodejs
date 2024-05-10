var express = require('express');
var router = express.Router();
var modelUser = require('../models/user');
// GET all users.
router.get('/', async function (req, res, next) {
    try {
        var data = await modelUser.find();
        res.json({ data: data });
    } catch (error) {
        res.status(500).json({ status: false, message: "Lỗi khi lấy dữ liệu người dùng" });
    }
});
// POST register user.
router.post('/register', async function (req, res, next) {
    try {
        const { email, password, coin } = req.body;
        console.log(email, password, coin);
        // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu chưa
        const existingUser = await modelUser.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ status: false, message: "Email đã tồn tại trong hệ thống" });
        }
        // Nếu email không tồn tại, tiếp tục quá trình đăng ký
        const userInsert = new modelUser({
            email: email,
            password: password,
            coin: coin ? coin : 0 // Nếu không có coin được cung cấp, mặc định là 0
        });
        await userInsert.save();
        res.json({ status: true, message: 'Thêm người dùng thành công' });
    } catch (error) {
        res.status(500).json({ status: false, message: "Thêm người dùng thất bại" });
    }
});
// POST login user.
router.post('/login', async function (req, res, next) {
    try {
        const { email, password } = req.body;
        const user = await modelUser.findOne({ email, password });
        if (!user) {
            res.status(401).json({ status: false, message: "Đăng nhập thất bại" });
            return;
        }
        res.status(200).json({ status: true, message: "Đăng nhập thành công", data: user });
    } catch (error) {
        res.status(500).json({ status: false, message: "Lỗi khi đăng nhập" });
    }
});

module.exports = router;
