import { runQuery } from "../database/sqlLite.db.js";

export const getChatHistory = async (req, res) => {
  const userId = req.user.userId;

  try {
    const chatHistory = await runQuery(
      `SELECT * FROM chats 
       WHERE userId = ? 
       ORDER BY createdAt ASC`, // ✅ oldest → newest
      [userId]
    );

    res.json({
      success: true,
      chatHistory,
      message: "history processed successfully",
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chat history",
    });
  }
};
