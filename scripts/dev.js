// 开发环境打包脚本

const { resolve } = require('path')

// 使用minimist获取到命令行的自定义参数
const args = require('minimist')(process.argv.slice(2))

// 获取目标打包模块名
const target = args._[0] || 'reactivity';
// 获取目标打包运行环境
const format = args.f || 'global';
// 获取具体的包
const pkg = require(resolve(_dirname, `../packages/${target}/package.json`))

// IIFE立即执行函数 CommonJS ESModule
const outputFormat = format.startsWith('global') ? 'iife' : format === 'cjs' ? 'cjs' : 'esm'