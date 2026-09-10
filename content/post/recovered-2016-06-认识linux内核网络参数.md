+++
title = "认识Linux内核网络参数"
date = "2016-06-17T21:03:24+08:00"
url = "/2016/06/认识linux内核网络参数/"
categories = []
clearReading = true
+++
<!-- Recovered article body from forfreedom a3ffc19; original Markdown was absent. -->

<div class="main-content-wrap">
<h2 id="认识linux内核网络参数">认识Linux内核网络参数</h2>
<ul>
<li>
<p>本地端口</p>
<p>TCP、UDP使用的本地端口范围</p>
<p><code>net.ipv4.ip_local_port_range = 1024 65535  （/etc/sysctl.conf，service network restart）</code></p>
</li>
<li>
<p>优化短链接</p>
</li>
</ul>
<table>
<thead>
<tr>
<th>选项</th>
<th>含义</th>
</tr>
</thead>
<tbody>
<tr>
<td>net.ipv4.tcp_fin_timeout = 15</td>
<td>处于FIN-WAIT-2状态的时间，建议10</td>
</tr>
<tr>
<td>net.ipv4.tcp_tw_reuse = 1</td>
<td>允许将 TIME-WAIT sockets重新用于新的TCP连接</td>
</tr>
<tr>
<td>net.ipv4.tcp_tw_recycle = 1</td>
<td>表示开启TCP连接中TIME-WAIT sockets的快速回收(建议关闭)</td>
</tr>
<tr>
<td>net.ipv4.tcp_syncookies</td>
<td>防止syn flood攻击，当syn backlog满时发送syncookies(建议关闭)</td>
</tr>
<tr>
<td>net.ipv4.tcp_syn_retries</td>
<td>初始SYN重传次数，默认5</td>
</tr>
<tr>
<td>net.ipv4.tcp_keepalive_intvl</td>
<td>tcp keepalive探测间隔时间，默认75s，可减小</td>
</tr>
<tr>
<td>net.ipv4.tcp_keepalive_probes</td>
<td>最大探测次数，默认9，可减小</td>
</tr>
<tr>
<td>net.ipv4.tcp_keepalive_time</td>
<td>只有在SO_KEEPALIVE设置时才启用，链接空闲多久发送keepalive，默认7200s，空闲后大概11min关闭连接，可减小</td>
</tr>
</tbody>
</table>
<ul>
<li>
<p>缓冲区大小</p>
<p>套接字的缓冲区大小限制,从Linux2.6.7内核会根据传输情况自动调整</p>
<p>默认值：</p>
<p>net.ipv4.tcp_rmem = 4096 87380 4194304
net.ipv4.tcp_wmem = 4096 16384 4194304</p>
<p>TCP读写缓存区，缓存区超过4194304，tcp包会丢弃</p>
<p>BDP(带宽延时积)=B*D (带宽＊延时)  反推 带宽=BDP/延时   4194304/(0.015*2)/1024/1024=133M/s</p>
<p>建议值：</p>
</li>
</ul>
<table>
<thead>
<tr>
<th>选项</th>
<th>含义</th>
</tr>
</thead>
<tbody>
<tr>
<td>net.core.rmem_default = 262144</td>
<td>默认套接字接受缓存区大小</td>
</tr>
<tr>
<td>net.core.wmem_default = 262144</td>
<td>默认套接字发送缓存区大小</td>
</tr>
<tr>
<td>net.core.rmem_max = 16777216</td>
<td>接收最大值</td>
</tr>
<tr>
<td>net.core.wmem_max = 16777216</td>
<td>发送最大值</td>
</tr>
<tr>
<td>net.ipv4.tcp_rmem = 4096 87380 16777216</td>
<td>tcp接收缓存区大小</td>
</tr>
<tr>
<td>net.ipv4.tcp_wmem = 4096 65536 16777216</td>
<td>tcp发送缓存区大小</td>
</tr>
</tbody>
</table>
<ul>
<li>
<p>增大初始拥塞窗口</p>
<p>依据：慢启动</p>
<ul>
<li>规则
窗口从一个小的值开始
指数增长
上限阈值</li>
<li>合理性
避免淹没慢的接收方
避免网络瘫痪</li>
<li>问题
往往慢启动还没终止，连接已经结束
用户的速度极限还没到</li>
</ul>
<p>根据实验结果进行设置慢启动窗口大小 ip route change</p>
<pre><code>ip route | while read p; do
    ip route change $p initcwnd 10
done
</code></pre><pre><code>   
 提高性能百分比，降低TCP重传率的影响

</code></pre></li>
<li>
<p>拥塞控制算法</p>
<p>net.ipv4.tcp_congestion_control = cubic</p>
</li>
<li>
<p>服务器开发</p>
<ul>
<li>
<p>操作的对象是socket读写缓冲区</p>
</li>
<li>
<p>send/write成功并不代表已经发送到对端</p>
</li>
<li>
<p>应用程序中响应时间的含义</p>
</li>
<li>
<p>明白设置缓冲区大小的影响</p>
</li>
<li>
<p>关键应用需要保证可靠性</p>
</li>
<li>
<p>需要应用级别的心跳检测</p>
</li>
<li>
<p>合理使用重要的TCP选项</p>
<ul>
<li>TCP_DEFER_ACCEPT</li>
<li>TCP_CORK</li>
<li>TCP_NODELAY</li>
</ul>
</li>
<li>
<p>使用writev/readv</p>
</li>
<li>
<p>真正理解non-blocking的套接字编程</p>
</li>
<li>
<p>真正理解epoll</p>
</li>
</ul>
</li>
<li>
<p>队列</p>
<ul>
<li>Listen队列
<ul>
<li>net.ipv4.tcp_max_syn_backlog = 16384</li>
<li>net.core.somaxconn = 2048</li>
</ul>
</li>
<li>网卡的接收队列
<ul>
<li>net.core.netdev_max_backlog = 10000</li>
</ul>
</li>
<li>网卡发送队列(网卡中断绑定)
<ul>
<li>ifconfig eth0 txqueuelen 10000</li>
</ul>
</li>
</ul>
</li>
</ul>
<pre><code>man listen
The behavior of the backlog argument on TCP sockets changed with Linux 2.2.
Now  it  specifies  the queue  length  for  completely  established sockets 
waiting to be accepted, instead of the number of incomplete connection 
requests.  The maximum length of the queue for incomplete sockets can  be  set 
using /proc/sys/net/ipv4/tcp_max_syn_backlog.  When syncookies are enabled 
there is no logical maxi‐mum length and this setting is ignored.  See tcp(7) 
for more information.

If the backlog argument is greater than  the  value  in  /proc/sys/net/core/
somaxconn,  then  it  is silently  truncated to that value; the default value 
in this file is 128.  In kernels before 2.4.25,this limit was a hard coded 
value, SOMAXCONN, with the value 128.

net.ipv4.tcp_max_syn_backlog：最大半开连接数，未完成TCP 3次握手的连接数，如果设置了
net.ipv4.tcp_syncookies则该设置被忽略

net.core.somaxconn：最大连接数(完成TCP 3次握手)，listen函数backlog含义相同，当backlog大
于somaxconn时设置为somaxconn
</code></pre><p>－ TCP拥塞控制</p>
<pre><code>    手段
        慢启动
        拥塞避免
        快速重传
        快速恢复
    目的
        探测网络速度
        保证传输顺畅
		
    TIME_WAIT
        net.ipv4.tcp_max_tw_buckets 处于TIME_WAIT状态sockets最大值
        主动关闭   服务端不主动关闭socket连接不会走到TIME_WAIT状态，no zuo no die
        2＊MSL
    CLOSE_WAIT
        被动关闭
        99%意味着程序有bug  从TCP状态图来看，收到FIN进入CLOSE_WAIT，未关闭socket、发送FIN，停留在该状态</code></pre>
</div>

