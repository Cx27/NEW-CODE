import { getDeviceInfo, getIPInfo, whoisLookup, getPrivateIP } from './api-utils.js';

const pageLoadTime = new Date();

function formatHelp(commands) {
    let helpText = 'Perintah yang tersedia:<br><br><table class="help-table">';
    
    const commandList = ['help', 'clear', 'date', 'whoami', 'echo', 'uname', 'neofetch', 'ip', 'ifconfig', 'whois', 'ping', 'hostname', 'history'];

    commandList.forEach(cmd => {
        let description = '';
        switch (cmd) {
            case 'help': description = 'Menampilkan pesan bantuan ini.'; break;
            case 'clear': description = 'Membersihkan layar terminal.'; break;
            case 'date': description = 'Menampilkan tanggal dan waktu saat ini.'; break;
            case 'whoami': description = 'Menampilkan nama user saat ini.'; break;
            case 'echo': description = 'Menampilkan kembali teks. Penggunaan: echo [teks]'; break;
            case 'uname': description = 'Menampilkan info sistem. Penggunaan: uname -a'; break;
            case 'neofetch': description = 'Menampilkan info OS & Browser dengan gaya.'; break;
            case 'ip': description = 'Menampilkan informasi IP publik Anda.'; break;
            case 'ifconfig': description = 'Menampilkan info IP. Penggunaan: ifconfig [-a] untuk info lengkap.'; break;
            case 'ping': description = 'Mengukur latensi ke host. Penggunaan: ping [domain]'; break;
            case 'whois': description = 'Mencari info registrasi domain. Penggunaan: whois [domain]'; break;
            case 'history': description = 'Menampilkan riwayat perintah.'; break;
            case 'hostname': description = 'Menampilkan nama host virtual.'; break;
        }
        helpText += `<tr><td class="command-name">${cmd}</td><td>${description}</td></tr>`;
    });

    helpText += '</table>';
    return helpText;
}

function detectBrowser(ua) {
    let match = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(match[1])) {
        let tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return `IE ${tem[1] || ''}`;
    }
    if (match[1] === 'Chrome') {
        let tem = ua.match(/\b(OPR|Edge|Edg)\/(\d+)/);
        if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera').replace('Edg', 'Edge');
    }
    match = match[2] ? [match[1], match[2]] : [navigator.appName, navigator.appVersion, '-?'];
    let tem = ua.match(/version\/(\d+)/i);
    if (tem != null) match.splice(1, 1, tem[1]);
    return `${match[0]} ${match[1]}`;
}

function getOSLogo(osName) {
    const logos = {
        'Windows': `
<span class="neofetch-logo">:::::::::::::::::</span>
<span class="neofetch-logo">::  <span class="neofetch-highlight">:::::</span>  ::::</span>
<span class="neofetch-logo">::  <span class="neofetch-highlight">:::::</span>  ::::</span>
<span class="neofetch-logo">:::::::::::::::</span>
<span class="neofetch-logo">::  <span class="neofetch-highlight">:::::</span>  ::::</span>
<span class="neofetch-logo">::  <span class="neofetch-highlight">:::::</span>  ::::</span>
<span class="neofetch-logo">:::::::::::::::::</span>`,
        'macOS': `
<span class="neofetch-logo">      .:'</span>
<span class="neofetch-logo">  __ :'__</span>
<span class="neofetch-logo">.'\`  <span class="neofetch-highlight">'-'</span>  \`\`.</span>
<span class="neofetch-logo">: <span class="neofetch-highlight">..</span>   <span class="neofetch-highlight">..</span> :</span>
<span class="neofetch-logo">  \`.__ .__.'</span>
<span class="neofetch-logo">      </span>`,
        'Linux': `
<span class="neofetch-logo">    .--.</span>
<span class="neofetch-logo">   |<span class="neofetch-highlight">o_o</span> |</span>
<span class="neofetch-logo">   |:<span class="neofetch-highlight">_/</span> |</span>
<span class="neofetch-logo">  //   \ \\</span>
<span class="neofetch-logo"> (|     | )</span>
<span class="neofetch-logo">/'\_   _/ \`\\</span>
<span class="neofetch-logo">\___)=(___/</span>`,
        'Android': `
<span class="neofetch-logo">   .o8888o.</span>
<span class="neofetch-logo">  8888<span class="neofetch-highlight">8</span>88888</span>
<span class="neofetch-logo">  '88.' \`.<span class="neofetch-highlight">88</span></span>
<span class="neofetch-logo">  '88' \`'<span class="neofetch-highlight">88</span></span>
   <span class="neofetch-logo">'8'  '<span class="neofetch-highlight">8</span>'</span>`,
        'iOS': `
<span class="neofetch-logo">      .:'</span>
<span class="neofetch-logo">  __ :'__</span>
<span class="neofetch-logo">.'\`  <span class="neofetch-highlight">'-'</span>  \`\`.</span>
<span class="neofetch-logo">: <span class="neofetch-highlight">..</span>   <span class="neofetch-highlight">..</span> :</span>
<span class="neofetch-logo">  \`.__ .__.'</span>`
    };
    return logos[osName] || `<span class="neofetch-logo"><?></span>`;
}


export const terminalCommands = {
    help() { return formatHelp(this); },
    clear: () => '',
    date: () => new Date().toString(),
    whoami: () => 'guest',
    echo: (args) => args.join(' '),
    
    'uname': (args) => {
        if (args[0] === '-a') {
            const info = getDeviceInfo();
            return `BrowserKernel ${info.platform} ${info.os} - ${info.userAgent}`;
        } else {
            return 'Gunakan: uname -a';
        }
    },
    
    async neofetch() {
        const info = getDeviceInfo();
        const ip = await getIPInfo();
        const uptimeMinutes = Math.round((new Date() - pageLoadTime) / 60000);
        const deviceType = /Mobi|Android|iPhone/.test(info.userAgent) ? "Mobile" : "Desktop";
        const logo = getOSLogo(info.os);
        const details = [
            `<b>guest@cxz-portfolio</b>`,
            `-------------------`,
            `<b>OS:</b> ${info.os}`,
            `<b>Browser:</b> ${detectBrowser(info.userAgent)}`,
            `<b>Device:</b> ${deviceType}`,
            `<b>Platform:</b> ${info.platform}`,
            `<b>IP:</b> ${ip.ip || 'Unknown'}`,
            `<b>Location:</b> ${ip.city || 'Unknown'}, ${ip.country || 'Unknown'}`,
            `<b>Kernel:</b> emulated via JS`,
            `<b>Uptime:</b> ~${uptimeMinutes} minutes`
        ];
        const logoLines = logo.trim().split('\n');
        const maxLines = Math.max(logoLines.length, details.length);
        let output = '<table><tr><td style="vertical-align:top; padding-right:1.5em;">';
        let logoFormatted = logoLines.join('<br>');
        output += logoFormatted;
        output += '</td><td style="vertical-align:top;">';
        output += details.join('<br>');
        output += '</td></tr></table>';
        return output;
    },

    async ip() {
        const ip = await getIPInfo();
        if (ip.error) return `<span class="error">Error: ${ip.error}</span>`;
        return [
            `IP Address : ${ip.ip}`,
            `ISP        : ${ip.org}`,
            `City       : ${ip.city}`,
            `Region     : ${ip.region}`,
            `Country    : ${ip.country}`
        ].join('<br>');
    },

    async whois(args) {
        const target = args[0];
        if (!target) return 'Gunakan: whois [domain/ip]';
        const result = await whoisLookup(target);
        if (result.error) return `<span class="error">Error: ${result.error}</span>`;
        return [
            `Query for  : ${target}`,
            `-------------------`,
            `IP         : ${result.ip || 'n/a'}`,
            `City       : ${result.city || 'n/a'}`,
            `Region     : ${result.region || 'n/a'}`,
            `Country    : ${result.country_name || 'n/a'}`,
            `Org        : ${result.org || 'n/a'}`
        ].join('<br>');
    },

    async ifconfig(args) {
        if (args[0] === '-a') {
            const [publicInfo, privateInfo] = await Promise.allSettled([
                getIPInfo(),
                getPrivateIP()
            ]);

            let output = '<b>eth0: Public Interface</b>\n';
            if (publicInfo.status === 'fulfilled' && !publicInfo.value.error) {
                output += `  inet ${publicInfo.value.ip}\n  Org: ${publicInfo.value.org}\n\n`;
            } else {
                output += `  <span class="error">Gagal mengambil IP Publik.</span>\n\n`;
            }

            output += '<b>wlan0: Local Interface (WebRTC)</b>\n';
            if (privateInfo.status === 'fulfilled') {
                 output += `  inet ${privateInfo.value}\n`;
            } else {
                 output += `  <span class="error">${privateInfo.reason.message}</span>\n`;
            }
            return output;

        } else {
            return this.ip();
        }
    },

    async ping(args) {
        const host = args[0];
        if (!host) return 'Gunakan: ping [domain] (contoh: ping google.com)';
        let output = `Pinging ${host}...\n`;
        for (let i = 0; i < 4; i++) {
            const startTime = performance.now();
            try {
                await fetch(`https://${host}`, { mode: 'no-cors', cache: 'no-cache' });
                const endTime = performance.now();
                const time = Math.round(endTime - startTime);
                output += `Reply from ${host}: time=${time}ms\n`;
            } catch (error) {
                output += `Request timed out.\n`; break; 
            }
        }
        output += `\n(Catatan: Ini adalah simulasi latensi HTTP, bukan ICMP ping asli)`;
        return output;
    },

    hostname: () => 'cxz-portfolio.vps',

    history(args, commandHistory) {
        if (!commandHistory || commandHistory.length === 0) return 'Tidak ada riwayat.';
        return commandHistory.map((cmd, i) => `${String(i + 1).padStart(3, ' ')}  ${cmd}`).join('<br>');
    }
};