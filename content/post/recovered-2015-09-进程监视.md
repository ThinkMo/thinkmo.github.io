+++
title = "进程监视"
date = "2015-09-10T10:07:34+08:00"
url = "/2015/09/进程监视/"
categories = []
clearReading = true
+++
<!-- Recovered article body from forfreedom a3ffc19; original Markdown was absent. -->

<div class="main-content-wrap">
<h1 id="进程监视">进程监视</h1>
<h2 id="1ps监视进程的主要工具">1、ps监视进程的主要工具</h2>
<pre><code>ps -ef 查看每一个进程
ps aux 可以展示系统进程的全貌
ps lax 更快，省去了将uid转换为用户名
ps -ejH  or  ps axjf 进程树
ps -eLf  or  ps axms 线程信息
</code></pre>
<h3 id="字段含义">字段含义</h3>
<table>
<thead>
<tr>
<th>字段</th>
<th>内容</th>
</tr>
</thead>
<tbody>
<tr>
<td>USER</td>
<td>进程属主用户名</td>
</tr>
<tr>
<td>PID</td>
<td>进程ID</td>
</tr>
<tr>
<td>CPU</td>
<td>进程使用CPU百分比</td>
</tr>
<tr>
<td>MEM</td>
<td>进程使用内存百分比</td>
</tr>
<tr>
<td>VSZ</td>
<td>进程虚拟内存大小KiB</td>
</tr>
<tr>
<td>RSS</td>
<td>驻留集大小，非swap中的内存大小</td>
</tr>
<tr>
<td>STAT</td>
<td>进程状态 S:可中断睡眠 D:不可中断睡眠 R:running s会话头</td>
</tr>
<tr>
<td>TIME</td>
<td>运行时间</td>
</tr>
<tr>
<td>COMMAND</td>
<td>命令行</td>
</tr>
<tr>
<td>NI</td>
<td>nice值</td>
</tr>
<tr>
<td>WCHAN</td>
<td>等待的资源</td>
</tr>
</tbody>
</table>
<h2 id="2top动态查看">2、top动态查看</h2>
<pre><code>top对活动进程及所使用的资源情况提供了汇总信息
</code></pre>
<h2 id="3proc文件系统">3、proc文件系统</h2>
<pre><code>proc文件系统提供了内核产生的所有状态信息与数据系统，包括进程相关的信息，linux的ps、top都是从/proc目录读取进程的状态信息。进程特有的信息存储在/proc/pid下。
</code></pre>
<h2 id="4strace">4、strace</h2>
<pre><code>strace -p pid可以追踪进程的系统调用及信号，在调试进程、理解程序执行过程非常有帮助。
</code></pre>
<h2 id="5vmstat">5、vmstat</h2>
<pre><code>vmstat提供了关于进程、内存、内存页、块IO、陷阱、磁盘及CPU的活动信息。
</code></pre>
<p>###字段含义
字段 | 内容
—- | —-
r|等待执行的进程数
b|不可中断睡眠的进程数
swpd|使用虚拟内存大小
free|空闲内存
cache|用作cache的内存大小
si|swap in
so|swap out
bi|block in从块设备收到数据块数
bo|block out
in|每秒中断数
cs|每秒上下文切换数
us|user time
sy|system time
id|idle time
wa|wait for io</p>
</div>

