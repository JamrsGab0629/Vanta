import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import User from '../model/userModel';

const verifyAuth = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      message: 'Unauthorized: User not found or has no cookies',
      success: false,
    });
  }

  try {
    const user = await User.findByPk(userId, {
      attributes: ['user_id'],
    });

    if (!user) {
      return res.status(401).json({
        message: 'User session invalid or user no longer exists',
        success: false,
      });
    }

    return res.status(200).json({
      message: 'Still logged in',
      success: true,
    });
  } catch (error) {
    // Log the exact error to your Node terminal
    console.error('Error in verifyAuth controller:', error);

    return res.status(500).json({
      message: 'Error verifying authentication',
      success: false,
    });
  }
};

const fetchUserData = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      message: 'Unauthorized: No current user logged in',
      success: false,
    });
  }

  try {
    const user = await User.findByPk(userId, {
      attributes: ['first_name', 'last_name', 'user_id', 'role'],
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found in database',
        success: false,
      });
    }

    return res.status(200).json({
      message: 'User data fetched successfully',
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching user data',
      success: false,
    });
  }
};

const fetchUserInfo = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      message: 'Unauthorized: No current user logged in',
      success: false,
    });
  }

  try {
    const user = await User.findByPk(userId, {
      attributes: ['first_name', 'last_name', 'contact_no', 'address'],
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found in database',
        success: false,
      });
    }

    return res.status(200).json({
      message: 'User data fetched successfully',
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching user data',
      success: false,
    });
  }
};


export { verifyAuth, fetchUserData, fetchUserInfo };
