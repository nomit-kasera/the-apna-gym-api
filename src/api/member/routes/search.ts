export default {
  routes: [
    {
      method: "GET",
      path: "/member/search",
      handler: "member.searchByPhone",
      config: {
        auth: false,
      },
    },
  ],
};
