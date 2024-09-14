---
slug: "/blog/frontend-file-preview"
title: "前端实现文件预览"
date: "2022-06-20 20:53:21"
brief: "在项目中经常用到文件在线预览的功能，文件格式以pdf、docx、excel为主，在此进行简单的组件封装，便于复用。"
tag: "react"
---



### 预览pdf

> [react-pdf 官方文档](https://github.com/wojtekmaj/react-pdf) 



#### 安装依赖

```shell
npm i -S react-pdf
```



#### 开始使用

1. 官方给的示例代码搬过来

2. 手动配置PDF.js worker

   可以通过CDN使用压缩过后的文件，也可以直接引入（文件本身压缩以后还有1M左右）

   这个文件在本地安装的模块下： `pdfjs-dist/build/pdf.worker.min.js` 

   ```tsx
   pdfjs.GlobalWorkerOptions.workerSrc = '';
   ```



#### 完整示例

> 包含翻页和缩放功能的简单示例。

```tsx
import React, { useState } from 'react';
import type { FC } from 'react';
import { InputNumber, Spin, Tooltip } from 'antd';
import { LeftOutlined, RightOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { Document, Page, pdfjs } from 'react-pdf';
import config from '@config';

const { base } = config;

// 手动配置PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `${base}/pdf/pdf.worker.min.js`;

type PDFViewerProps = {
  file?: string | File;
  containerStyle?: React.CSSProperties;
};

const PDFViewer: FC<PDFViewerProps> = (props) => {
  const { file, containerStyle } = props;
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageNoInput, setPageNoInput] = useState<number>(1);
  const [zoomPercent, setZoomPercent] = useState<number>(100);

  const onDocumentLoadSuccess = ({ numPages }: any) => {
    setNumPages(numPages);
  };

  // 上一页 & 下一页
  const onPageStep = (step: number) => {
    if ((step === -1 && pageNumber === 1) || (step === 1 && pageNumber === numPages)) return;
    setPageNumber(pageNumber + step);
  };

  // 页面跳转
  const onPageNoInputChange = (v: number) => {
    setPageNoInput(v);
  };

  const jumpToPage = (e: any) => {
    let v = e.target.value;
    v = Math.min(v, numPages);
    v = Math.max(v, 1);
    setPageNoInput(v);
    setPageNumber(v);
  }

  const onPageZoomIn = () => {
    if (zoomPercent >= 200) return;
    setZoomPercent(zoomPercent + 20);
  };

  const onPageZoomOut = () => {
    if (zoomPercent <= 100) return;
    setZoomPercent(zoomPercent - 20);
  };

  return (
    <div className={styles.viewer} style={{ ...containerStyle }}>
      <div className={styles.pageContainer}>
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<Spin size="large" />}
        >
          <Page pageNumber={pageNumber} width={595 * zoomPercent / 100} loading={<Spin size="large" />} />
        </Document>
      </div>

      {numPages > 0 && (
        <div className={styles.pageToolbar}>
          <Tooltip title={pageNumber == 1 ? '已是第一页' : '上一页'}>
            <LeftOutlined
              style={{
                fontSize: 16,
                color: pageNumber === 1 ? '#d8d8d8' : '#fff',
                cursor: pageNumber === 1 ? 'not-allowed' : 'pointer',
              }}
              onClick={() => onPageStep(-1)}
            />
          </Tooltip>
          <InputNumber
            controls={false}
            style={{ width: 50, textAlign: 'center' }}
            min={1}
            max={numPages}
            step={1}
            value={pageNoInput}
            onChange={onPageNoInputChange}
            onPressEnter={jumpToPage}
          />{' '}
          / {numPages}
          <Tooltip title={pageNumber == numPages ? '已是最后一页' : '下一页'}>
            <RightOutlined
              style={{
                fontSize: 16,
                color: pageNumber === numPages ? '#d8d8d8' : '#fff',
                cursor: pageNumber === numPages ? 'not-allowed' : 'pointer',
              }}
              onClick={() => onPageStep(1)}
            />
          </Tooltip>
          <Tooltip title="缩小">
            <ZoomOutOutlined style={{ fontSize: 16 }} onClick={onPageZoomOut} />
          </Tooltip>
          <span className={styles.zoomPercent}>{zoomPercent}%</span>
          <Tooltip title="放大">
            <ZoomInOutlined style={{ fontSize: 16 }} onClick={onPageZoomIn} />
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
```



### 预览docx文件

> [docx-preview 官方文档](https://github.com/VolodymyrBaydalka/docxjs) 

#### 安装依赖

```shell
npm i -S docx-preview
```



#### 开始使用

`renderAsync` 方法的第一个参数是 `Blob` 类型：

- 通过用户操作时从 input 选择本地文件获取
- 读取在线文件地址，使用 ajax 请求文件流



#### 完整示例

```tsx
import React, { useEffect, useRef } from 'react';
import type { FC } from 'react';
import { defaultOptions, renderAsync } from 'docx-preview';

const docxOptions = Object.assign(defaultOptions, {
  debug: true,
  experimental: true,
  useMathMLPolyfill: true,
});

type DocxViewerProps = {
  file: string | File;
}

const DocxViewer: FC<DocxViewerProps> = (props) => {
  const viewerDomRef = useRef<HTMLDivElement>(null);

  // 根据文件地址请求文件流
  const loadFile = async (file: string) => {
    const response = await fetch(file, {
      method: 'GET'
    });
    const blobData = await response.blob();
    renderAsync(blobData, viewerDomRef.current!, undefined, docxOptions);
  };

  useEffect(() => {
    if (typeof props.file === 'string') {
      loadFile(props.file);
    } else {
      renderAsync(props.file, viewerDomRef.current!, undefined, docxOptions);
    }
  }, [props.file]);

  return <div ref={viewerDomRef}></div>;
};

export default DocxViewer;
```



### 预览Excel文件

> [sheetjs 官方文档](https://github.com/SheetJS/sheetjs)

#### 安装依赖

```shell
npm i -S xlsx
```



#### 开始使用

- 从xlsx/xls文件中读取数据

  ！！注意：文件中的超链接样式无法读取，文件中的图片内容无法读取。

- 展示数据表格



#### 完整实例

```tsx
import React, { useState, ChangeEvent } from 'react';
import DataGrid, { TextEditor } from 'react-data-grid';
import { read, utils, WorkSheet } from 'xlsx';

// 支持读取xls文件
// @ts-ignore
import * as cptable from 'xlsx/dist/cpexcel.full.mjs';
set_cptable(cptable);

type Row = any[]; /*{
  [index: string]: string | number;
};*/

type Column = {
  key: string;
  name: string;
  editor: typeof TextEditor;
};

type DataSet = {
  [index: string]: WorkSheet;
};

// 将Excel表格数据转为json二维数组
function getRowsCols(
  data: DataSet,
  sheetName: string,
): {
  rows: Row[];
  columns: Column[];
} {
  const rows: Row[] = utils.sheet_to_json(data[sheetName], {
    header: 1,
    defval: null,
    blankrows: false,
    dateNF: 'yyyy-mm-dd',
    raw: false,
  });
  let columns: Column[] = [];

  for (let row of rows) {
    const keys: string[] = Object.keys(row);

    if (keys.length > columns.length) {
      columns = keys.map((key) => {
        return { key, name: utils.encode_col(+key), editor: TextEditor };
      });
    }
  }

  return { rows, columns };
}

const ExcelViewer = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [workBook, setWorkBook] = useState<DataSet>({} as DataSet);
  const [sheets, setSheets] = useState<string[]>([]);
  const [current, setCurrent] = useState<string>('');

  function selectSheet(name: string, reset = true) {
    if (reset)
      workBook[current] = utils.json_to_sheet(rows, {
        header: columns.map((col: Column) => col.key),
        skipHeader: true,
      });

    const { rows: new_rows, columns: new_columns } = getRowsCols(workBook, name);
    setRows(new_rows);
    setColumns(new_columns);
    setCurrent(name);
  }

  async function handleFile(ev: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = await ev.target.files?.[0]?.arrayBuffer();
    const data = read(file);

    setWorkBook(data.Sheets);
    setSheets(data.SheetNames);
  }

  return (
    <>
      <input type="file" onChange={handleFile} />
      <div className="flex-cont">
        {sheets.map((sheet) => (
          <button key={sheet} onClick={(e) => selectSheet(sheet)}>
            {sheet}
          </button>
        ))}
      </div>
      <div className="flex-cont">
        <b>Current Sheet: {current}</b>
      </div>
      <DataGrid columns={columns} rows={rows} onRowsChange={setRows} />
    </>
  );
};

export default ExcelViewer;
```

