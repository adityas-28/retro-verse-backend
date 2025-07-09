import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(500, "Something went wrong while generating access and refresh tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // Steps :
  // 1. get user data from request
  // 2. validation
  // 3. check if user already exists
  // 4. check for images
  // 5. upload imgs to cloudinary
  // 6. create user object; create entry in db
  // 7. remove pssword, refresh tokens from response
  // 8. check for user creation; return response

  const { username, email, password } = req.body;
  // console.log(username, email, password, fullname);

  if (
    [username, email, password].some((field) => {
      field?.trim() === "";
    })
  ) {
    throw new apiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existedUser) {
    throw new apiError(409, "User already exists");
  }

  const user = await User.create({
    email,
    password,
    username: username.toLowerCase(),
    coins: 500
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new apiError(500, "Something went wrong while creating user");
  }

  return res.status(201).json(new apiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // 1. get user data from request body
  // 2. ask for email or username
  // 3. find the user
  // 4. password check
  // 5. access and refresh token
  // 6. send cookies

  const { email, username, password } = req.body || {};

  if (!username && !email) {
    throw new apiError(400, "Email or username is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (!user) {
    throw new apiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new apiError(401, "Incorrect password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  if (!loggedInUser) {
    throw new apiError(500, "Something went wrong while logging in user");
  }

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new apiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  // 1. clear cookies
  // 2. return response
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined }
    },
    {
      new: true
    }
  );

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new apiError(401, "Unauthorized Request");
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new apiError(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken != user?.refreshToken) {
      throw new apiError(401, "Refresh Token Expired");
    }

    const options = {
      httpOnly: true,
      secure: true
    };

    const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new apiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access Token Refreshed Successfully")
      );
  } catch (error) {
    throw new apiError(401, error?.message || "Invalid Refresh Token");
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (newPassword != confirmPassword) {
    throw new apiError(400, "Password and Confirm Password do not match");
  }

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new apiError(401, "Incorrect old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new apiResponse(200, {}, "Password updated successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json(new apiResponse(200, { user: req.user }, "User found successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (fullname && email) {
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: { fullname, email }
      },
      {
        new: true
      }
    ).select("-password -refreshToken");

    return res.status(200).json(new apiResponse(200, { user }, "Account details updated successfully"));
  } else if (fullname) {
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: { fullname }
      },
      {
        new: true
      }
    ).select("-password -refreshToken");

    return res.status(200).json(new apiResponse(200, { user }, "Account details updated successfully"));
  } else if (email) {
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: { email }
      },
      {
        new: true
      }
    ).select("-password -refreshToken");

    return res.status(200).json(new apiResponse(200, { user }, "Account details updated successfully"));
  } else {
    throw new apiError(400, "Fullname or email is required");
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updatePassword,
  getCurrentUser,
  updateAccountDetails
};
