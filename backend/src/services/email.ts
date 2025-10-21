export const sendPasswordResetEmail = async (to: string, token: string) => {
  const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${encodeURIComponent(token)}`;
  
  console.log(`
═══════════════════════════════════════════
📧 PASSWORD RESET EMAIL
═══════════════════════════════════════════
To: ${to}
Link: ${link}
Expires: 15 minutes
═══════════════════════════════════════════
  `);
  
  return { ok: true };
};