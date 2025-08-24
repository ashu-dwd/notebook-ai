import prisma from "../database/prisma.db.js";

export const getChatHistory = async (req, res) => {
  const userId = req.user.userId;

  try {
    const chatHistory = await prisma.chats.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

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
