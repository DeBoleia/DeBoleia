// userProfileRoutes.js

const express = require("express");
const router = express.Router();
const userProfileController = require("../controllers/userProfileControllers");
const verifyToken = require("../middleware/middleware");//


// ======================== POST ======================== //


// ======================== GET ======================== //

// Get all users
router.get("/", /*verifyToken,*/ userProfileController.getAllUsers);

// Get user (by its ID)
router.get("/id/:userID", /*verifyToken,*/ userProfileController.getUserByUserID);

// Get user (by its ID)
router.get("/email/:email", verifyToken, userProfileController.getUserByEmail);

// Get user by token
router.get("/byToken", verifyToken, userProfileController.getUserByToken);

// Get user for driver
router.get("/passenger", verifyToken, userProfileController.getPassengersInfo);

// Get user for driver
// router.get("/trip/:tripCode", verifyToken, userProfileController.getPassengerInfoByTripCode);

// ======================== PUT ======================== //

// Put user by userID
router.put("/id/:userID", verifyToken, userProfileController.updateUserByUserID);

// Put user by email
router.put("/email/:email", verifyToken, userProfileController.updateUserByEmail);

router.put('/status/:email', verifyToken, userProfileController.changeStatusByEmail);


router.put("/pass/:userID", verifyToken, userProfileController.changePasswordByUserID);

// // ======================== PATCH ======================== //

// User ratings after the trips
router.patch("/ratedriver/:userID", userProfileController.rateDriver)
router.patch("/ratepassengers", verifyToken, userProfileController.ratePassengers)
router.patch("/rateOnePassenger", userProfileController.rateOnePassenger)



// ======================== DELETE ======================== //

// Delete user by userID (for testing purposes)
router.delete("/id/:userID", verifyToken, userProfileController.deleteUser);

module.exports = router;










// // Update user rating and nAvaliacoes (receive rating and userId)
// router.patch("/rating", verifyToken, userProfileController.updateUserRating );

// //editar a própria palavra pass
// router.patch(
//   "/change-password",
//   verifyToken,
//   celebrate({
//     body: Joi.object({
//       currentPassword: Joi.string().required(),
//       newPassword: Joi.string().required(),
//     }),
//   }),
//   userProfileController.changePassword
// );

// // Para admin: mudar o tipo e eAtivo de um user (by email)
// router.patch( "/editar/:email", verifyToken, userProfileController.editUserByEmail );

// // Delete lógico para o próprio user (by token)
// router.patch( "/forget", verifyToken, userProfileController.forgetUserByToken
// );




