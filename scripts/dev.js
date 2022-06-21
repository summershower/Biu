// Esbuild开发环境打包脚本

const { build } = require('esbuild');
const { resolve } = require('path');

// 使用minimist获取到命令行的自定义参数
const args = require('minimist')(process.argv.slice(2))

// 获取命令行参数传进来的打包模块名
const target = args._[0] || 'reactivity';

// 获取命令行参数传进来的目标运行环境
const format = args.f || 'global';

// 获取具体的包配置文件
const packageJson = require(resolve(__dirname, `../packages/${target}/package.json`))

// 目标打包环境： IIFE立即执行函数、CommonJS、ESModule
const outputFormat = format.startsWith('global') ? 'iife' : format === 'cjs' ? 'cjs' : 'esm'

// 设置打包生成的文件路径及文件名
const outfile = resolve(__dirname, `../packages/${target}/dist/${target}.js`)

build({
    entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
    outfile,
    bundle: true,
    sourcemap: true,
    format: outputFormat,
    globalName: packageJson.buildOptions.name,
    platform: format === 'cjs' ? 'node' : 'browser',
    watch: {
        onRebuild(error) {
            if (!error) console.log('rebuild')
        }
    }

}).then(() => {
    console.log('构建成功')
})