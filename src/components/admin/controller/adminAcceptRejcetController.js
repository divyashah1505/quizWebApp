const withDrawRequest = require("../../user/models/withDrawRequest");
const withdrawalRequest = require("../../user/models/withDrawRequest");
const { appString } = require("../../utils/appString");
const { success } = require("../../utils/commonUtils");
const WithdrawRequest = require("../../user/models/withDrawRequest");
const User =require("../../user/models/user")
const Wallet = require("../../user/models/wallet")
const Admin = require("../model/admin")
const withDrawAcceptRejcectController = {
    getWithDrawRequest: async (req, res) => {
        try {
            const requests = await withDrawRequest.find()
                .populate("userId" ,"name email")

            res.json({ success: true, data: requests })

        } catch (error) {

            console.log(error);

            res.status(500).json({ success: false, message: appString.SERVERERROR })

        }
    },
    updateWithdrawStatus: async (req, res) => {

        try {

            const { requestId } = req.params;
            const { status } = req.body; // Accepted / Rejected

            const request = await WithdrawRequest.findById(requestId);

            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: appString.REQUESTNOTFOUND
                })
            }

            if (request.status !== 0) {
                return res.status(400).json({
                    success: false,
                    message: appString.REQUESTALREDYPROCEED
                })
            }

            if (status === 2) {

                request.status = 2;

                await request.save();

                return res.json({
                    success: true,
                    message: appString.WITHDRAWREQUESTREJECTED
                })

            }

            if (status === 1) {

                const adminFee = request.amount * 0.10;

                const userAmount = request.amount - adminFee;

                let wallet = await Wallet.findOne({ userId: request.userId });

                if (!wallet) {
                    wallet = await Wallet.create({
                        userId: request.userId,
                        balance: 0
                    })
                }

                Wallet.balance += userAmount;

                await wallet.save();

                const admin = await Admin.findOne();

                Admin.adminFeeConfigure += adminFee;

                await admin.save();

                request.status = 1;

                await request.save();

                return res.json({
                    success: true,
                    message: appString.WITHDRAWAPPROVED,
                    adminFee,
                    userAmount
                })

            }

        } catch (error) {

            console.log(error)

            res.status(500).json({
                success: false,
                message: appString.SERVERERROR
            })

        }

    }
};
module.exports = withDrawAcceptRejcectController
