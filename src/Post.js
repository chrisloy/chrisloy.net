import React from 'react';
import Markdown from 'react-markdown';
import posts from './posts/index.json';
import moment from 'moment';

posts.reverse();

function fileNameToUrl(fileName) {
  return fileName
   .replace(/\-/, "/")
   .replace(/\-/, "/")
   .replace(/\-/, "/")
   .replace(/\.md/, "");
}

function fileNameToDate(fileName) {
  return moment(fileName.substring(0, 10)).format('Do MMMM YYYY');
}

function fileNameToContent(fileName) {
  return require(`./posts/${fileName}`);
}

function fileNameToTitle(fileName) {
  return fileNameToContent(fileName).match(/(.*)\n/)[1];
}

export const Posts = posts.map(fileName => {
  return {
    url: fileNameToUrl(fileName),
    date: fileNameToDate(fileName),
    title: fileNameToTitle(fileName)
  }
})

export const Post = (props) => {

  const year = props.params.year;
  const month = props.params.month;
  const day = props.params.day;
  const fileId = props.params.fileId;
  const fileName = `${year}-${month}-${day}-${fileId}.md`;

  return (
    <div className="blog">
      <h3 style={{float: "right", marginTop: 0, marginLeft: "2em"}} className="date">
        {fileNameToDate(fileName)}
      </h3>
      <Markdown source={fileNameToContent(fileName)}/>
    </div>
  );
};
