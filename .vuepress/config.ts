import { defineUserConfig } from "vuepress";
import type { DefaultThemeOptions } from "vuepress";
import recoTheme from "vuepress-theme-reco";

export default defineUserConfig({
  title: "宏夏Coding",
  description: "Just playing around",
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  theme: recoTheme({
    style: "@vuepress-reco/style-default",
    logo: "/logo.png",
    author: "宏夏c",
    authorAvatar: "/head.png",
    docsRepo: "https://github.com/vuepress-reco/vuepress-theme-reco-next",
    docsBranch: "main",
    docsDir: "example",
    lastUpdatedText: "",
    // series 为原 sidebar
    series: {
      "/docs/theme-reco/": [
        {
          text: "模块一",
          children: ["home", "theme"],
        },
        {
          text: "模块二",
          children: ["api", "plugin"],
        },
      ],
      "/docs/os/": [
        {
          text: "介绍",
          children: ["introduce"],
        },
        {
          text: "存储器管理",
          children: ["memorizer", "memorizer-que"],
        },
        {
          text: "进程管理",
          children: ["process-management"],
        },
        {
          text: "经典问题",
          children: ["typical-problem"],
        },
      ],
      "/blogs/Java/": [
        {
          text: "介绍",
          children: ["guide","092101"],
        },

      ],

    },



    sidebar: 'auto',
    lastUpdated: 'Last Updated',

    //导航栏
    navbar: [
      { text: "主页", link: "/" },
      {
        text: "求职秘籍",
        children: [
          { text: "校招日程", link: "/docs/job-hunting/timeline" },
          { text: "简历投递", link: "/docs/job-hunting/delivery-channels" },
          { text: "面试技巧", link: "/docs/job-hunting/interview-skills" },
        ],
      },
      {
        text: "葵花宝典",
        children: [
          { text: "操作系统", link: "/docs/os/memorizer" },
          { text: "软件工程", link: "/docs/software-engineering/summary" },
          { text: "git命令", link: "/docs/git/git" },
        ],
      },
      { text: "技术博客", link: "/" },
      { text: "读书笔记", link: "/" },
      {
        text: "绝世资源",
        children: [
          { text: "AI工具", link: "/docs/os/introduce" },
          { text: "编程必备软件", link: "/docs/resources/software" },
          { text: "笔记工具", link: "/blogs/category2/2016/121501" },
        ],
      },
      { icon: 'LogoGithub', text: "Github", link: 'https://github.com/hongxiaCoder' }
    ],

    //公告
    bulletin: {
      body: [
        {
          type: "text",
          content: `🎉🎉🎉`,
          style: "font-size: 12px;",
        },
        {
          type: "hr",
        },
        {
          type: "title",
          content: "QQ ",
        },
        {
          type: "text",
          content: `
          <ul>
            <li>QQ：809114964</li>
            <li>VX:Diane3501</li>
          </ul>`,
          style: "font-size: 12px;",
        },
        {
          type: "hr",
        },
        {
          type: "title",
          content: "GitHub",
        },
        {
          type: "text",
          content: `
          <ul>
            <li><a href="https://github.com/vuepress-reco/vuepress-theme-reco-next/issues">Issues<a/></li>
            <li><a href="https://github.com/vuepress-reco/vuepress-theme-reco-next/discussions/1">Discussions<a/></li>
          </ul>`,
          style: "font-size: 12px;",
        },
        {
          type: "hr",
        },
        {
          type: "buttongroup",
          children: [
            {
              text: "打赏",
              link: "/docs/others/donate.html",
            },
          ],
        },
      ],
    },
    // commentConfig: {
    //   type: 'valie',
    //   // options 与 1.x 的 valineConfig 配置一致
    //   options: {
    //     // appId: 'xxx',
    //     // appKey: 'xxx',
    //     // placeholder: '填写邮箱可以收到回复提醒哦！',
    //     // verify: true, // 验证码服务
    //     // notify: true,
    //     // recordIP: true,
    //     // hideComments: true // 隐藏评论
    //   },
    // },
  }),
  // debug: true,
});
