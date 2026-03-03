// Heavily truncated version of the following library to adapt for oxlint:
// https://github.com/Stuk/eslint-plugin-header, MIT License, Copyright (c) 2015 Stuart Knightley

function match(actual, expected) {
  if (expected.test) {
    return expected.test(actual);
  } else {
    return expected === actual;
  }
}

function excludeShebangs(comments) {
  return comments.filter(function (comment) {
    return comment.type !== 'Shebang';
  });
}

const licensePattern = [
  '',
  / \* Copyright Splunk Inc\.(, .+)*$/,
  ' *',
  ' * Licensed under the Apache License, Version 2.0 (the "License");',
  ' * you may not use this file except in compliance with the License.',
  ' * You may obtain a copy of the License at',
  ' *',
  ' *     http://www.apache.org/licenses/LICENSE-2.0',
  ' *',
  ' * Unless required by applicable law or agreed to in writing, software',
  ' * distributed under the License is distributed on an "AS IS" BASIS,',
  ' * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.',
  ' * See the License for the specific language governing permissions and',
  ' * limitations under the License.',
  ' ',
];

const licenseLines = [...licensePattern];
licenseLines[1] = ' * Copyright Splunk Inc.';

// Returns either the first block comment or the first set of line comments that
// are ONLY separated by a single newline. Note that this does not actually
// check if they are at the start of the file since that is already checked by
// hasHeader().
function getLeadingComments(context, node) {
  var all = excludeShebangs(
    context
      .getSourceCode()
      .getAllComments(node.body.length ? node.body[0] : node)
  );
  if (all[0].type.toLowerCase() === 'block') {
    return [all[0]];
  }
  for (var i = 1; i < all.length; ++i) {
    var txt = context
      .getSourceCode()
      .getText()
      .slice(all[i - 1].range[1], all[i].range[0]);
    if (!txt.match(/^(\r\n|\r|\n)$/)) {
      break;
    }
  }
  return all.slice(0, i);
}

function genCommentBody(commentType, textArray, eol, numNewlines) {
  var eols = eol.repeat(numNewlines);
  if (commentType === 'block') {
    return '/*' + textArray.join(eol) + '*/' + eols;
  } else {
    return '//' + textArray.join(eol + '//') + eols;
  }
}

function genPrependFixer(commentType, node, headerLines, eol, numNewlines) {
  return function (fixer) {
    return fixer.insertTextBefore(
      node,
      genCommentBody(commentType, headerLines, eol, numNewlines)
    );
  };
}

function hasHeader(src) {
  if (src.substr(0, 2) === '#!') {
    var m = src.match(/(\r\n|\r|\n)/);
    if (m) {
      src = src.slice(m.index + m[0].length);
    }
  }
  return src.substr(0, 2) === '/*' || src.substr(0, 2) === '//';
}

function matchesLineEndings(src, num) {
  for (var j = 0; j < num; ++j) {
    var m = src.match(/^(\r\n|\r|\n)/);
    if (m) {
      src = src.slice(m.index + m[0].length);
    } else {
      return false;
    }
  }
  return true;
}

const rule = {
  meta: {
    fixable: 'whitespace',
  },
  create: (context) => {
    return {
      Program: function (node) {
        const commentType = 'block';
        const eol = '\n';
        const numNewlines = 2;
        const headerLines = licensePattern;
        if (!hasHeader(context.getSourceCode().getText())) {
          context.report({
            message: 'missing header',
            loc: node.loc,
            fix: genPrependFixer(
              commentType,
              node,
              licenseLines,
              eol,
              numNewlines
            ),
          });
        } else {
          var leadingComments = getLeadingComments(context, node);

          if (!leadingComments.length) {
            context.report({
              loc: node.loc,
              message: 'missing header',
            });
          } else if (leadingComments[0].type.toLowerCase() !== commentType) {
            context.report({
              loc: node.loc,
              message: 'header should be a {{commentType}} comment',
              data: {
                commentType: commentType,
              },
            });
          } else {
            // if block comment pattern has more than 1 line, we also split the comment
            var leadingLines = [leadingComments[0].value];
            if (headerLines.length > 1) {
              leadingLines = leadingComments[0].value.split(/\r?\n/);
            }

            var hasError = false;
            if (leadingLines.length > headerLines.length) {
              hasError = true;
            }
            for (i = 0; !hasError && i < headerLines.length; i++) {
              if (!match(leadingLines[i], headerLines[i])) {
                hasError = true;
              }
            }

            if (hasError) {
              context.report({
                loc: node.loc,
                message: 'incorrect header',
              });
            } else {
              var postBlockHeader = context
                .getSourceCode()
                .text.substr(leadingComments[0].range[1], numNewlines * 2);
              if (!matchesLineEndings(postBlockHeader, numNewlines)) {
                context.report({
                  loc: node.loc,
                  message: 'no newline after header',
                });
              }
            }
          }
        }
      },
    };
  },
};

const plugin = {
  meta: {
    name: 'file-header',
    fixable: 'whitespace',
  },
  rules: {
    copyright: rule,
  },
};

module.exports = plugin;
