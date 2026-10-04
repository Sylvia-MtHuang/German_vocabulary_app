# 歌德 B1 词表整理记录

来源：[Goethe-Zertifikat B1 官方词表](https://www.goethe.de/pro/relaunch/prf/de/Goethe-Zertifikat_B1_Wortliste.pdf)，通过[歌德官方 B1 备考页](https://www.goethe.de/de/m/spr/prf/ueb/pb1.html)核对下载入口。调研日期：2026-10-04。

## 收录范围与计数

收录 PDF 第 8–15 页的主题词汇，以及第 16–102 页的字母词表。官方说明约有 2,400 个词汇单位。本应用将明确列出的性别、地区、拼写、词缀、缩写全称和常用时间表达拆分为学习条目，因此卡片数与官方词汇单位数不同。

本次整理得到 3,570 个不同的规范词条，生成 3,571 张卡片。其中 1,411 张复用现有学习内容，2,160 张补写英文释义、中文释义、原创德语日常例句及中英文例句译文。同一词条的不同含义分别保留，例如 Bank 的“银行”和“长椅”。词条级页码与原始写法保存在 `b1-source-entries.json`。

## 核对与规范化

- 校正双栏 PDF 的词条边界，包括 besitzen、parkieren、schlafen、transportieren、unten 等被拼入前一词条的情况。
- 保留德国、奥地利和瑞士明确列出的变体，包括 Bankomat、Velo、Znüni、Zvieri、Pöstlerin，以及不同冠词和拼写。
- 展开可选形式，例如 biologisch、meistens、nahe、Schrecken、wie viele；保留明确列出的前后缀。
- 将形容词词干改为可学习的常见形式，例如 nächst- → nächste、link- → linke、recht- → rechte。保留另列的 links、rechts、selbst。
- 完整保留 in Pension sein、in Rente sein 等短语，避免将省略写法中的 sein 当作整个短语。
- 依据原始复数提示补充名词形式；修正复合词的变音位置、带空格的复数后缀及 Daten、Früchte 等复数词标记。没有原始依据的物质名词不推造复数。
- 第 9 页明确列出 der Terminal，本次保留官方写法。

新内容直接在本地编写；未复制官方例句。已有 A1/A2 文件与中文译文保留。B1 在词库选择器中独立出现，学习记录按词库分别保存。

## 验证

`tests/b1-wordbook.test.cjs` 核对规范词条覆盖、卡片 ID、学习字段、中文内容、复数、关键地区变体和独立学习记录。现有词库及中文内容测试一并执行。

浏览器验证使用隔离存储的 `tests/language.html?book=goethe-b1` 与 `tests/responsive.html?book=goethe-b1&limit=60`。后者覆盖中英文、十种屏幕尺寸、最长卡片、学习/错题卡片及复习题型。全量布局检查保留默认入口，并增加分段让出执行的处理，避免大词库长时间阻塞测试页面。

最终结果：B1 词条与既有词库检查通过；中文内容检查覆盖全部 5,787 张卡片；最终 B1 浏览器语言检查 28 项通过，最长卡片布局检查 2,164 项通过、零失败。原来的全量布局运行未取得结果，本次界面结论以限定 B1 的最长卡片检查为依据。
