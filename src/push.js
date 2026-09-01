const superagent = require("superagent");

/**
 * 构建 Server酱请求的 URL
 * @param {string} sendKey - Server酱 SendKey
 * @returns {string} 完整的请求 URL
 */
function buildServerChanUrl(sendKey) {
  // 检查是否为新的 sctp 类型 SendKey
  if (sendKey.startsWith("sctp")) {
    // 提取 sctp 与 t 之间的数字 (uid)
    const match = sendKey.match(/^sctp(\d+)t/);
    if (match) {
      const uid = match[1];
      return `https://${uid}.push.ft07.com/send/${sendKey}.send`;
    }
  }
  // 使用标准的 sct 类型 URL
  return `https://sctapi.ftqq.com/${sendKey}.send`;
}

/**
 * 发送 Server酱微信通知
 * @param {string} title - 消息标题（必填，不能含换行）
 * @param {string} desp - 消息正文（可选，支持 Markdown）
 */
async function sendServerChanNotification(title, desp = "") {
  const sendKey = process.env.SERVERCHAN_SENDKEY;

  // 检查 SendKey 是否存在
  if (!sendKey) {
    console.warn(
      "⚠️  未设置 SERVERCHAN_SENDKEY 环境变量。请到 https://sct.ftqq.com 免费获取（每天 5 条额度）"
    );
    return;
  }

  // 验证 title 不包含换行符
  if (title.includes("\n") || title.includes("\r")) {
    console.error("❌ Server酱标题不能包含换行符");
    return;
  }

  try {
    const url = buildServerChanUrl(sendKey);

    const response = await superagent
      .post(url)
      .send({
        title: title.substring(0, 32), // Server酱标题限制
        desp: desp,
      })
      .timeout(10000); // 10秒超时

    const body = response.body;

    // 检查返回的 code
    if (body.code === 0) {
      console.log("✅ Server酱通知发送成功");
    } else {
      console.error(`❌ Server酱通知失败: code=${body.code}, msg=${body.message}`);
    }
  } catch (error) {
    console.error("❌ 发送 Server酱通知异常:", error.message);
  }
}

module.exports = sendServerChanNotification;
