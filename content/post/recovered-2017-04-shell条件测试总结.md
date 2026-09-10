+++
title = "shell条件测试总结"
date = "2017-04-27T18:55:34+08:00"
url = "/2017/04/shell条件测试总结/"
categories = []
clearReading = true
+++
<!-- Recovered article body from forfreedom a3ffc19; original Markdown was absent. -->

<div class="main-content-wrap">
<p>在编写shell脚本时，条件测试与判断必不可少，基于测试结果才能做进一步的处理，此文用来回顾下shell脚本中的条件测试。</p>
<h2 id="test">test([)</h2>
<p>test有两种格式，即<code>test condition</code> 或 <code>[ condition ]</code>(注意条件两边空格)，
test主要用来测试文件、字符串及数字。</p>
<ul>
<li>
<p>逻辑操作符</p>
<p>-a 逻辑与 -o 逻辑或 ! 逻辑非(不是短路求值)</p>
<p><strong>best practise：使用多个[，而不是-a与-o</strong></p>
<ul>
<li>good : [ “$a” = “$b” ] &amp;&amp; [ “$b” = “$c” ]</li>
<li>bad : [ “$a” = “$b” -a “$b” = “$c” ]</li>
</ul>
</li>
<li>
<p>文件测试</p>
</li>
</ul>
<table>
<thead>
<tr>
<th>参数</th>
<th>含义</th>
<th>参数</th>
<th>含义</th>
</tr>
</thead>
<tbody>
<tr>
<td>-d</td>
<td>目录</td>
<td>-s</td>
<td>文件长度大于0、非空</td>
</tr>
<tr>
<td>-f</td>
<td>普通文件</td>
<td>-w</td>
<td>可写</td>
</tr>
<tr>
<td>-L</td>
<td>符号链接</td>
<td>-u</td>
<td>文件有suid置位</td>
</tr>
<tr>
<td>-r</td>
<td>可读</td>
<td>-x</td>
<td>可执行</td>
</tr>
</tbody>
</table>
<p>例如:</p>
<pre><code>$if [ -f files ];then
&gt; echo "files is a normal file"
&gt; fi
files is a normal file
</code></pre><ul>
<li>字符串测试(<strong>注意符号两侧的空格</strong>)</li>
</ul>
<table>
<thead>
<tr>
<th>参数</th>
<th>含义</th>
</tr>
</thead>
<tbody>
<tr>
<td>-z</td>
<td>空串</td>
</tr>
<tr>
<td>-n</td>
<td>非空串</td>
</tr>
<tr>
<td>=</td>
<td>相等</td>
</tr>
<tr>
<td>!=</td>
<td>不相等</td>
</tr>
</tbody>
</table>
<p>例如：</p>
<pre><code>test "a" = "b"
echo $?
1
</code></pre><ul>
<li>测试数值</li>
</ul>
<table>
<thead>
<tr>
<th>参数</th>
<th>含义</th>
</tr>
</thead>
<tbody>
<tr>
<td>-eq</td>
<td>相等</td>
</tr>
<tr>
<td>-ge</td>
<td>大于等于</td>
</tr>
<tr>
<td>-gt</td>
<td>大于</td>
</tr>
<tr>
<td>-le</td>
<td>小于等于</td>
</tr>
<tr>
<td>-lt</td>
<td>小于</td>
</tr>
<tr>
<td>-ne</td>
<td>不等</td>
</tr>
</tbody>
</table>
<h2 id="expr">expr</h2>
<p>expr一般用于正数值，也可用于字符串，一般格式为 expr arg operator arg，
支持 | &amp;  &lt;  &lt;=  =  !=  &gt;=  &gt;  +  -  *  /  % 等操作，此外</p>
<ul>
<li>模式匹配 STRING : REGEXP （匹配()之间的字符串）</li>
</ul>
<pre><code>$expr "hello.world" : "\(.*\).world"
hello
</code></pre><ul>
<li>求子串 substr STRING POS LENGTH （POS从1开始）</li>
</ul>
<pre><code>$expr substr "hello world" 7 5
world
</code></pre><ul>
<li>求位置 index STRING CHARS（多个字符返回最前匹配的字符）</li>
</ul>
<pre><code>$expr index "hello world" e
2
</code></pre><ul>
<li>求长度 length STRING</li>
</ul>
<pre><code>$expr length "hello world"
11
</code></pre><h2 id="heading">[[</h2>
<ul>
<li>[[比test功能更强大，只有bash、zsh等支持[[，而test更加便于移植(推荐使用[[)</li>
<li>[[是关键字，test是command</li>
<li>[[ 短路求值</li>
</ul>
<!-- raw HTML omitted -->
<!-- raw HTML omitted -->
<h2 id="-算数求值与比较bash">(( 算数求值与比较(bash)</h2>
<ul>
<li>算术运算符+ - * / % **</li>
<li>赋值运算符= *= /= %= += -= «= »= &amp;= ^= |=</li>
<li>逻辑运算符	&gt; &lt; &gt;= &lt;= == != ! &amp;&amp; ||</li>
<li>位操作符 ~ « » &amp; | ^</li>
<li>其他 ++  – ?: ()</li>
</ul>
</div>

