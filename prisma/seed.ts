import { SITE_CONTENT_DEFAULTS } from '../src/lib/siteContentDefaults';
import { slugify } from '../src/lib/project';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai seeding database...');

  // 1. Seed Admin User
  const adminUsername = 'admin';
  const adminPassword = 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.adminUser.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      username: adminUsername,
      passwordHash: passwordHash
    }
  });
  console.log(`Admin user: ${admin.username} / ${adminPassword}`);

  // 2. Seed Projects — only if empty
  const existingProjects = await prisma.project.count();
  if (existingProjects === 0) {
    const projectsData = [
      {
        title: 'Sistem Informasi LSP UGM',
        description: 'Platform terintegrasi untuk Lembaga Sertifikasi Profesi Universitas Gadjah Mada. Menyederhanakan proses sertifikasi profesi mulai dari pendaftaran asesi hingga penerbitan sertifikat kompetensi yang terstandarisasi dan diakui BNSP.',
        imageUrl: '/assets/projects/lsp-ugm.png',
        liveUrl: 'https://silsp.trpl.space',
        githubUrl: null,
        tags: ['Laravel', 'PHP', 'MySQL', 'REST API'],
        category: 'web',
        status: 'live',
        year: '2025',
        role: 'Web Developer',
        featured: true,
        order: 1,
        visible: true
      },
      {
        title: "Java Al-'Alim UGM",
        description: "Website resmi Jama'ah Vokasi Al-'Alim Sekolah Vokasi UGM, dibangun sebagai monorepo Next.js dan Hono. Pengurus mengelola formulir, agenda kegiatan, dan struktur organisasi dari dashboard dengan login akun UGM.",
        imageUrl: '/assets/projects/java-ugm.png',
        liveUrl: 'https://javaugm.hallojanu.me',
        githubUrl: null,
        tags: ['Next.js', 'Hono', 'Drizzle', 'PostgreSQL', 'NextAuth', 'Docker'],
        category: 'web',
        status: 'live',
        year: '2026',
        role: 'Lead developer (Ketua Dept. Media)',
        highlights: [
          'Monorepo web (Next.js) + api (Hono, OpenAPI) + db (Postgres, RLS)',
          'Form builder publik /f/slug: validasi ketat, honeypot, rate-limit, ekspor CSV, file jawaban privat',
          'Agenda kegiatan dari Google Calendar dengan cache dan fallback saat Google down',
          'Log aktivitas admin append-only yang menjaga privasi data',
          'Struktur organisasi + modal anggota, dikelola dari dashboard',
          'Login Google (NextAuth) khusus @mail.ugm.ac.id dengan whitelist & role dari database'
        ],
        featured: true,
        order: 2,
        visible: true
      },
      {
        title: 'Website PPDB MA Amanatul Ummah',
        description: 'Sistem website Penerimaan Peserta Didik Baru (PPDB) untuk MA Unggulan Amanatul Ummah Surabaya. Menampilkan informasi sekolah, berita, panduan pendaftaran, dan formulir online bagi calon peserta didik baru.',
        imageUrl: '/assets/projects/ppdb-mai.png',
        liveUrl: 'https://mai-au.sch.id',
        githubUrl: null,
        tags: ['PHP', 'Laravel', 'TailwindCSS', 'MySQL'],
        category: 'web',
        status: 'live',
        year: '2022 - 2024',
        role: 'Web Developer & Asisten IT',
        order: 3,
        visible: true
      },
      {
        title: "Jama'ah Vokasi Al-'Alim (WordPress)",
        description: "Website resmi Jama'ah Vokasi Al-'Alim berbasis WordPress di domain resmi UGM. Memuat artikel, kegiatan organisasi, dan media dakwah untuk komunitas mahasiswa muslim Sekolah Vokasi UGM.",
        imageUrl: '/assets/projects/java-wordpress.png',
        liveUrl: 'https://javamuslim.sv.ugm.ac.id',
        githubUrl: null,
        tags: ['WordPress', 'PHP', 'CMS', 'UGM'],
        category: 'web',
        status: 'live',
        order: 4,
        visible: true
      },
      {
        title: 'Cak MaD Editor',
        description: 'Editor Markdown di browser untuk menulis catatan dan dokumen teknis, termasuk rumus LaTeX dan diagram Mermaid. Dokumen tersimpan otomatis di perangkat dan bisa diekspor ke PDF.',
        imageUrl: null,
        liveUrl: 'https://cakmad.vercel.app',
        githubUrl: 'https://github.com/januarsyah901/CakMaD',
        tags: ['React 19', 'Vite', 'TailwindCSS', 'CodeMirror'],
        category: 'tool',
        status: 'live',
        year: '2026',
        role: 'Solo developer',
        highlights: [
          'LaTeX via KaTeX & diagram Mermaid',
          'Editor tabel visual & paste gambar langsung',
          'Multi-dokumen dengan tab, drag & drop, autosave lokal',
          'Ekspor PDF A4/A3/Letter dengan margin kustom',
          'Focus mode, template, dark/light mode'
        ],
        featured: true,
        order: 5,
        visible: true
      },
      {
        title: 'Cepaty',
        description: 'Aplikasi menu bar macOS yang menampilkan kecepatan internet dan trafik tiap aplikasi. Berjalan tanpa akses root dan hampir tidak memakai CPU saat di latar belakang.',
        imageUrl: null,
        liveUrl: null,
        githubUrl: 'https://github.com/januarsyah901/cepaty',
        releaseUrl: 'https://github.com/januarsyah901/cepaty/releases/latest',
        tags: ['Swift', 'SwiftUI', 'AppKit', 'macOS'],
        category: 'desktop',
        status: 'open-source',
        year: '2026',
        role: 'Solo developer',
        highlights: [
          'Kecepatan unduh/unggah live di menu bar',
          'Trafik per aplikasi dengan ikon asli macOS',
          'Tanpa root/kernel extension, CPU 0.0% di background (~45 MB)',
          'Snapshot nettop periodik + kalkulasi delta (hemat daya)',
          'Unit test, CI GitHub Actions, installer DMG'
        ],
        order: 6,
        visible: true
      },
      {
        title: 'Boros Token',
        description: 'Dashboard lokal untuk memantau pemakaian token dan perkiraan biaya beberapa AI coding agent sekaligus. Riwayat disimpan di SQLite dan grafik diperbarui langsung lewat Server-Sent Events.',
        imageUrl: null,
        liveUrl: null,
        githubUrl: 'https://github.com/januarsyah901/boros-token',
        tags: ['Node.js', 'SQLite', 'SSE', 'Chart.js', 'Docker'],
        category: 'tool',
        status: 'open-source',
        year: '2026',
        role: 'Solo developer',
        highlights: [
          'Pantau token Claude Code, Codex, OpenCode, Grok dalam satu dashboard',
          'Live update via Server-Sent Events',
          'Riwayat di SQLite + grafik tren',
          'Registry harga per model untuk estimasi biaya',
          'App menu bar macOS native & REST API'
        ],
        order: 7,
        visible: true
      }
    ];

    for (const proj of projectsData) {
      await prisma.project.create({ data: { ...proj, slug: slugify(proj.title) } });
    }
    console.log('Projects seeded.');
  } else {
    console.log('Projects already exist, skipping.');
  }

  // 3. Seed BlogVideos — only if empty
  const existingVideos = await prisma.blogVideo.count();
  if (existingVideos === 0) {
    const videosData = [
      {
        videoId: '7651547919576812817',
        caption: 'Part 2: Bikin monitor laptop bekas jadi monitor eksternal',
        tags: ['#monitor', '#laptopbekas', '#laptoprusak', '#fyppp'],
        order: 1,
        visible: true
      },
      {
        videoId: '7649396644290596117',
        caption: 'Isi galeri cowo',
        tags: ['#CapCut', '#9router', '#hotwheels', '#ngoding', '#mancing'],
        order: 2,
        visible: true
      },
      {
        videoId: '7647545349942430996',
        caption: 'Biang kerok yang sering bikin limit. Cara biar ga boros token.',
        tags: ['#ai', '#token', '#bot', '#agent', '#gemini'],
        order: 3,
        visible: true
      },
      {
        videoId: '7645643023283457301',
        caption: 'Bocil ketauan nyolong API key',
        tags: ['#claude', '#ai', '#parodi', '#fypシ', '#bocil'],
        order: 4,
        visible: true
      },
      {
        videoId: '7639756301941116180',
        caption: 'YTTA hihi, saran sound dong',
        tags: ['#quote', '#love', '#programming', '#javascript', '#learncoding'],
        order: 5,
        visible: true
      },
      {
        videoId: '7639669422306741524',
        caption: 'Nggak perlu bayar app cleaner — AI agent bisa lakuin semua itu, gratis. Set up agent CLI untuk cleaning laptop.',
        tags: ['#aitrend', '#ai', '#claude', '#developerindonesia', '#programming', '#macbook', '#tipsandtricks'],
        order: 6,
        visible: true
      },
      {
        videoId: '7638126581625539861',
        caption: 'Tutorial ucapin ultah buat doi pake website',
        tags: ['#coding', '#vscode', '#github', '#hbd', '#ultah'],
        order: 7,
        visible: true
      },
      {
        videoId: '7603236338476813588',
        caption: 'Status error-nya 404 mulu',
        tags: ['#programmer', '#fyp', '#frontend', '#backend', '#website'],
        order: 8,
        visible: true
      },
      {
        videoId: '7523618082602880273',
        caption: 'Nih cara dapetin AI tercanggih yang belum rilis!',
        tags: ['#programmer', '#programmerhumor', '#xybca', '#openai', '#chatgpt', '#sora'],
        order: 9,
        visible: true
      },
      {
        videoId: '7516932007151078663',
        caption: 'Light mode is real!',
        tags: ['#programmer', '#fyp', '#frontend', '#backend', '#website', '#freelance', '#framework', '#darkmode', '#lightmode'],
        order: 10,
        visible: true
      },
      {
        videoId: '7511365024510774546',
        caption: 'Replying to @fahryzzz aku cuma nanyea lo',
        tags: ['#kesenjangan', '#programmer', '#docker', '#fyp'],
        order: 11,
        visible: true
      },
      {
        videoId: '7507455681386106120',
        caption: 'Duh endingnya 🙏',
        tags: ['#programmer', '#fyp', '#frontend', '#backend', '#website', '#freelance', '#laravel', '#framework'],
        order: 12,
        visible: true
      },
      {
        videoId: '7506130788564487431',
        caption: 'Cita-cita dan realita',
        tags: ['#programmer', '#citacita', '#realita', '#fypシ゚', '#xybca', '#programmerhumor', '#upinipin'],
        order: 13,
        visible: true
      },
      {
        videoId: '7504971644050492679',
        caption: 'Sory ye… kaum GitHub students mau lewat',
        tags: ['#codeeditor', '#meme', '#vscode', '#jetbrains', '#ngeleak', '#programmer', '#fyp', '#okegas'],
        order: 14,
        visible: true
      },
      {
        videoId: '7504480534874148114',
        caption: 'Cobain pake Docker deh',
        tags: ['#kesenjangan', '#programmer', '#docker', '#fyp', '#xyzabc'],
        order: 15,
        visible: true
      }
    ];

    for (const vid of videosData) {
      await prisma.blogVideo.create({ data: vid });
    }
    console.log('Blog videos seeded.');
  } else {
    console.log('Blog videos already exist, skipping.');
  }

  // 4. Seed Testimonials — only if empty
  const existingTestimonials = await prisma.testimonial.count();
  if (existingTestimonials === 0) {
    const testimonialsData = [
      {
        name: 'Dr. Budi Santoso',
        role: 'Ketua Lembaga Sertifikasi Profesi',
        company: 'Universitas Gadjah Mada',
        text: 'Sistem Informasi LSP yang dibangun oleh bang Jan sangat membantu kami dalam mendigitalisasi proses sertifikasi. Kerja samanya sangat profesional dan hasilnya melampaui ekspektasi.',
        rating: 5,
        visible: true
      },
      {
        name: 'Ahmad Fauzi',
        role: 'Koordinator IT',
        company: 'MA Amanatul Ummah',
        text: 'Website PPDB berjalan dengan lancar saat pendaftaran siswa baru. Sistem sangat stabil meskipun diakses oleh ribuan pendaftar secara bersamaan.',
        rating: 5,
        visible: true
      }
    ];

    for (const test of testimonialsData) {
      await prisma.testimonial.create({ data: test });
    }
    console.log('Testimonials seeded.');
  } else {
    console.log('Testimonials already exist, skipping.');
  }

  // 5. Seed Org/Event experience — only if the table is empty (first deploy). After that the
  // content is managed through the API/MCP; deleting every entry makes the next boot re-seed.
  const existingOrg = await prisma.orgExperience.count();
  if (existingOrg === 0) {
    const orgData = [
      {
        period: '2025 - Sekarang',
        organization: "JAVA (Jama'ah Vokasi Al-'Alim) SV UGM",
        role: 'Kepala Departemen Media',
        description: 'Memimpin departemen media dalam memproduksi konten dakwah kreatif, pemeliharaan website resmi, serta orkestrasi publikasi media sosial organisasi.',
        highlights: [
          'Mengembangkan dan mengelola website resmi JAVA SV UGM',
          'Mengorkestrasi strategi konten media sosial (@javaugm) dan branding organisasi',
          'Memimpin serta mengoordinasikan tim desain visual, dokumentasi video, dan copywriting'
        ],
        type: 'organization',
        logo: '/assets/org-logo.png',
        order: 1
      },
      {
        period: '2026 - Sekarang',
        organization: 'Google Student Ambassador Indonesia (Batch 2)',
        role: 'Ambassador & Ketua Tim GSA Buddy',
        description: 'Menjadi ambassador Google untuk mahasiswa Indonesia dan memimpin tim GSA Buddy.',
        highlights: [
          'Memimpin tim GSA Buddy sebagai ketua tim',
          'Berkontribusi dalam kegiatan konten dan event komunitas Google Student Ambassador'
        ],
        type: 'organization',
        order: 2
      },
      {
        period: '2022',
        organization: 'GALAXY 6.0',
        role: 'Ketua Divisi Acara Malam Puncak',
        description: 'Kepanitiaan event Olimpiade & Pensi Pelajar, bertanggung jawab atas acara malam puncak.',
        highlights: ['Memimpin divisi acara malam puncak pada rangkaian GALAXY 6.0'],
        type: 'event',
        order: 3
      }
    ];

    for (const entry of orgData) {
      await prisma.orgExperience.create({ data: entry });
    }
    console.log('Org experience seeded.');
  } else {
    console.log('Org experience already exists, skipping.');
  }

  // 6. Seed editable site sections (experience, skills, about, contact) — only the missing ones.
  // Deleting a section through the API/MCP resets it to this built-in text on the next boot.
  for (const [key, value] of Object.entries(SITE_CONTENT_DEFAULTS)) {
    const existing = await prisma.siteContent.findUnique({ where: { key } });
    if (!existing) {
      await prisma.siteContent.create({ data: { key, value: value as object } });
      console.log(`Site content "${key}" seeded.`);
    }
  }

  console.log('Seeding selesai!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
