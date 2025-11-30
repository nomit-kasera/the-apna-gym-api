export default {
    async afterCreate(event) {
        const { result } = event; // The created member
        try {
            await strapi.plugin("email").service("email").send({
                to: result.email,
                subject: "Welcome to The Apna Gym!",
                html: `
        <h2>Hello, ${result.full_name},</h2>
        <p>Your membership is successfully registered!</p>
        <p><b>Plan:</b> ${result.membership_type}</p>
        <p><b>Valid From:</b> ${result.start_date}</p>
        <p><b>Valid To:</b> ${result.end_date}</p>
        <br/>
        <p>Thank you for joining The Apna Gym 💪🔥</p>
      `,
            });
        } catch (err) {
            console.log("❌ EMAIL ERROR:", err);
        }
    }
};
