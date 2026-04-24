'use client';
import { useState, useRef, lazy, Suspense } from 'react';
import {
  Upload, FileText, Clipboard, Download, Zap, AlertCircle,
  CheckCircle, Copy, Mail, Lock, Star, Target, TrendingUp, Key,
  Eye, AlignLeft, Layout,
} from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { usePro } from '@/lib/pro';
import { parseCV, parseExperience, parseEducation } from '@/lib/cv-parser';

const CVPreview = lazy(() => import('@/components/CVPreview'));

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATES CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const TEMPLATES = [
  { id: 'modern-sidebar', name: 'Modern Sidebar', desc: 'Col. izquierda con fechas', dot: '#4f46e5' },
  { id: 'harvard',        name: 'Harvard Classic', desc: 'Una col., máximo ATS',     dot: '#374151' },
  { id: 'executive',      name: 'Executive Premium', desc: 'Header oscuro + gold',   dot: '#0f172a' },
  { id: 'tech',           name: 'Tech Minimal',    desc: 'Barra indigo, moderno',    dot: '#4f46e5' },
  { id: 'corporate',      name: 'Clean Corporate', desc: 'Clásico centrado',         dot: '#1e40af' },
];

// ─────────────────────────────────────────────────────────────────────────────
// PDF RENDERER — 5 templates via jsPDF
// ─────────────────────────────────────────────────────────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */

function renderModernSidebar(doc: any, text: string) {
  const cv = parseCV(text);
  const PW = 210, ML = 18, MR = 18, CW = PW - ML - MR;
  const LX = ML, LW = 37, RX = ML + LW + 4, RW = PW - MR - RX;
  const BOTTOM = 275;
  let y = 20;
  const newPage = () => { doc.addPage(); y = 20; };
  const checkY  = (h: number) => { if (y + h > BOTTOM) newPage(); };

  doc.setFontSize(24); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 15, 15);
  doc.text(cv.name, ML, y); y += 9;
  doc.setFontSize(11); doc.setFont('helvetica', 'normal'); doc.setTextColor(66, 99, 235);
  doc.text(cv.title, ML, y); y += 5;
  doc.setDrawColor(210, 210, 210); doc.setLineWidth(0.5); doc.line(ML, y, PW - MR, y); y += 4;
  doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(110, 110, 110);
  for (const cp of doc.splitTextToSize(cv.contact, CW)) { doc.text(cp, ML, y); y += 4; }
  y += 4;

  const drawHdr = (label: string) => {
    y += 2; checkY(12);
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 15, 15);
    doc.text(label, ML, y); y += 2;
    doc.setDrawColor(180, 180, 180); doc.setLineWidth(0.35); doc.line(ML, y, PW - MR, y); y += 5;
  };

  for (const sec of cv.sections) {
    if (sec.header === 'SKILLS') {
      drawHdr('SKILLS');
      const skills = sec.lines.filter(l => l.trim()).join(' ').split(/[|,]/).map((s: string) => s.trim()).filter(Boolean);
      doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 50, 50);
      doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.3);
      let cx = ML, rowY = y;
      for (const sk of skills) {
        const tw = doc.getTextWidth(sk), cW = tw + 6;
        if (cx + cW > PW - MR) { cx = ML; rowY += 9; checkY(12); }
        doc.roundedRect(cx, rowY, cW, 6, 1.5, 1.5, 'S');
        doc.text(sk, cx + 3, rowY + 4.3); cx += cW + 3;
      }
      y = rowY + 12;
    } else if (sec.header === 'EXPERIENCE') {
      checkY(38); drawHdr('EXPERIENCE');
      for (const e of parseExperience(sec.lines)) {
        checkY(30); let lY = y, rY = y;
        doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(110, 110, 110);
        for (const dl of doc.splitTextToSize(e.dates, LW)) { doc.text(dl, LX, lY); lY += 4.3; }
        doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(140, 140, 140);
        for (const ll of doc.splitTextToSize(e.location, LW)) { doc.text(ll, LX, lY); lY += 4; }
        doc.setFontSize(10.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 15, 15);
        for (const tl of doc.splitTextToSize(e.jobTitle, RW)) { doc.text(tl, RX, rY); rY += 5; }
        doc.setFontSize(9.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(66, 99, 235);
        for (const cl of doc.splitTextToSize(e.company, RW)) { doc.text(cl, RX, rY); rY += 4.5; }
        rY += 1;
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 50, 50);
        for (const b of e.bullets) {
          const bL = doc.splitTextToSize(b, RW - 5);
          if (rY + bL.length * 4.2 > BOTTOM) { newPage(); lY = y; rY = y; }
          doc.setFillColor(66, 99, 235); doc.circle(RX + 1.4, rY - 1.5, 0.9, 'F');
          doc.setTextColor(50, 50, 50);
          for (const bl of bL) { doc.text(bl, RX + 4.5, rY); rY += 4.2; }
        }
        y = Math.max(lY, rY) + 4;
      }
    } else if (sec.header === 'EDUCATION') {
      checkY(38); drawHdr('EDUCATION');
      for (const e of parseEducation(sec.lines)) {
        checkY(20); let lY = y, rY = y;
        doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(110, 110, 110);
        for (const dl of doc.splitTextToSize(e.dates, LW)) { doc.text(dl, LX, lY); lY += 4.3; }
        doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(140, 140, 140);
        for (const ll of doc.splitTextToSize(e.location, LW)) { doc.text(ll, LX, lY); lY += 4; }
        doc.setFontSize(10.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 15, 15);
        for (const dl of doc.splitTextToSize(e.degree, RW)) { doc.text(dl, RX, rY); rY += 5; }
        doc.setFontSize(9.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(66, 99, 235);
        for (const il of doc.splitTextToSize(e.institution, RW)) { doc.text(il, RX, rY); rY += 4.8; }
        y = Math.max(lY, rY) + 4;
      }
    } else {
      drawHdr(sec.header);
      doc.setFontSize(9.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 50, 50);
      const joined = sec.lines.filter((l: string) => l.trim()).join(' ');
      for (const wl of doc.splitTextToSize(joined, CW)) { checkY(5); doc.text(wl, ML, y); y += 4.8; }
      y += 2;
    }
  }
}

function renderHarvard(doc: any, text: string) {
  const cv = parseCV(text);
  const PW = 210, ML = 20, MR = 20, CW = PW - ML - MR, BOTTOM = 278;
  let y = 22;
  const newPage = () => { doc.addPage(); y = 22; };
  const checkY = (h: number) => { if (y + h > BOTTOM) newPage(); };

  doc.setFontSize(22); doc.setFont('helvetica', 'bold'); doc.setTextColor(10, 10, 10);
  doc.text(cv.name, PW / 2, y, { align: 'center' }); y += 8;
  doc.setFontSize(10); doc.setFont('helvetica', 'italic'); doc.setTextColor(80, 80, 80);
  doc.text(cv.title, PW / 2, y, { align: 'center' }); y += 5;
  doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100);
  for (const cl of doc.splitTextToSize(cv.contact, CW)) { doc.text(cl, PW / 2, y, { align: 'center' }); y += 4; }
  y += 2;
  doc.setDrawColor(150, 150, 150); doc.setLineWidth(0.6); doc.line(ML, y, PW - MR, y); y += 5;

  const drawHdr = (label: string) => {
    checkY(10); y += 2;
    doc.setFontSize(9.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(10, 10, 10);
    doc.text(label, ML, y); y += 2;
    doc.setDrawColor(150, 150, 150); doc.setLineWidth(0.4); doc.line(ML, y, PW - MR, y); y += 5;
  };

  for (const sec of cv.sections) {
    if (sec.header === 'SKILLS') {
      drawHdr('SKILLS');
      const skills = sec.lines.join(' ').split(/[|,]/).map((s: string) => s.trim()).filter(Boolean);
      doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 50, 50);
      for (const wl of doc.splitTextToSize(skills.join('  ·  '), CW)) { checkY(5); doc.text(wl, ML, y); y += 4.5; }
      y += 3;
    } else if (sec.header === 'EXPERIENCE') {
      checkY(38); drawHdr('EXPERIENCE');
      for (const e of parseExperience(sec.lines)) {
        checkY(30);
        // Measure date at correct font size before drawing job title
        doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100);
        const dwExp = doc.getTextWidth(e.dates);
        doc.setFontSize(10.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(10, 10, 10);
        doc.text(e.jobTitle, ML, y);
        doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100);
        doc.text(e.dates, PW - MR - dwExp, y); y += 5;
        doc.setFontSize(9.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(60, 60, 60);
        doc.text(e.company + (e.location ? '  ·  ' + e.location : ''), ML, y); y += 4.5;
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 50, 50);
        for (const b of e.bullets) {
          const bL = doc.splitTextToSize(b, CW - 7);
          checkY(bL.length * 4.2 + 1);
          doc.text('\u2022', ML + 1.5, y);
          for (const bl of bL) { doc.text(bl, ML + 5.5, y); y += 4.2; }
        }
        y += 4;
      }
    } else if (sec.header === 'EDUCATION') {
      checkY(38); drawHdr('EDUCATION');
      for (const e of parseEducation(sec.lines)) {
        checkY(20);
        doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100);
        const dwEdu = doc.getTextWidth(e.dates);
        doc.setFontSize(10.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(10, 10, 10);
        doc.text(e.degree, ML, y);
        doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100);
        doc.text(e.dates, PW - MR - dwEdu, y); y += 5;
        doc.setFontSize(9.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(60, 60, 60);
        doc.text(e.institution + (e.location ? '  ·  ' + e.location : ''), ML, y); y += 7;
      }
    } else {
      drawHdr(sec.header);
      doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 50, 50);
      const j = sec.lines.filter((l: string) => l.trim()).join(' ');
      for (const wl of doc.splitTextToSize(j, CW)) { checkY(5); doc.text(wl, ML, y); y += 4.5; }
      y += 3;
    }
  }
}

function renderExecutive(doc: any, text: string) {
  const cv = parseCV(text);
  const PW = 210, ML = 18, MR = 18, CW = PW - ML - MR, BOTTOM = 278;
  let y = 0;
  const newPage = () => { doc.addPage(); y = 22; };
  const checkY = (h: number) => { if (y + h > BOTTOM) newPage(); };

  doc.setFillColor(15, 23, 42); doc.rect(0, 0, PW, 40, 'F');
  doc.setFillColor(217, 119, 6); doc.rect(0, 40, PW, 2.5, 'F');
  doc.setFontSize(24); doc.setFont('helvetica', 'bold'); doc.setTextColor(248, 250, 252);
  doc.text(cv.name, ML, 16);
  doc.setFontSize(10.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(148, 163, 184);
  doc.text(cv.title, ML, 25);
  doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139);
  doc.text((doc.splitTextToSize(cv.contact, CW)[0] || cv.contact), ML, 34);
  y = 52;

  const drawHdr = (label: string) => {
    checkY(12); y += 3;
    doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
    doc.text(label, ML, y); y += 2;
    doc.setDrawColor(217, 119, 6); doc.setLineWidth(1.5); doc.line(ML, y, ML + 28, y);
    doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.3); doc.line(ML + 28, y, PW - MR, y); y += 6;
  };

  for (const sec of cv.sections) {
    if (sec.header === 'SKILLS') {
      drawHdr('SKILLS');
      const skills = sec.lines.join(' ').split(/[|,]/).map((s: string) => s.trim()).filter(Boolean);
      doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 50, 50);
      doc.setDrawColor(180, 180, 180); doc.setLineWidth(0.3);
      let cx = ML, rowY = y;
      for (const sk of skills) {
        const tw = doc.getTextWidth(sk), cW = tw + 6;
        if (cx + cW > PW - MR) { cx = ML; rowY += 9; checkY(12); }
        doc.roundedRect(cx, rowY, cW, 6, 1.5, 1.5, 'S');
        doc.text(sk, cx + 3, rowY + 4.3); cx += cW + 3;
      }
      y = rowY + 12;
    } else if (sec.header === 'EXPERIENCE') {
      checkY(38); drawHdr('EXPERIENCE');
      for (const e of parseExperience(sec.lines)) {
        checkY(30);
        const meta = e.dates + (e.location ? '  ·  ' + e.location : '');
        // Measure meta at correct font size
        doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(120, 120, 120);
        const mw = doc.getTextWidth(meta);
        doc.text(meta, PW - MR - mw, y);
        doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
        doc.text(e.jobTitle, ML, y); y += 5.5;
        doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 64, 175);
        doc.text(e.company, ML, y); y += 5;
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 50, 50);
        for (const b of e.bullets) {
          const bL = doc.splitTextToSize(b, CW - 6);
          checkY(bL.length * 4.2 + 1);
          doc.setFillColor(217, 119, 6); doc.circle(ML + 1.5, y - 1.5, 0.9, 'F');
          doc.setTextColor(50, 50, 50);
          for (const bl of bL) { doc.text(bl, ML + 4.5, y); y += 4.2; }
        }
        y += 5;
      }
    } else if (sec.header === 'EDUCATION') {
      checkY(38); drawHdr('EDUCATION');
      for (const e of parseEducation(sec.lines)) {
        checkY(20);
        doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(120, 120, 120);
        const dwEdu = doc.getTextWidth(e.dates);
        doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
        doc.text(e.degree, ML, y);
        doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(120, 120, 120);
        doc.text(e.dates, PW - MR - dwEdu, y); y += 5.5;
        doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 64, 175);
        doc.text(e.institution + (e.location ? '  ·  ' + e.location : ''), ML, y); y += 8;
      }
    } else {
      drawHdr(sec.header);
      doc.setFontSize(9.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 50, 50);
      const j = sec.lines.filter((l: string) => l.trim()).join(' ');
      for (const wl of doc.splitTextToSize(j, CW)) { checkY(5); doc.text(wl, ML, y); y += 4.8; }
      y += 3;
    }
  }
}

function renderTechMinimal(doc: any, text: string) {
  const cv = parseCV(text);
  const PW = 210, ML = 24, MR = 18, CW = PW - ML - MR, BOTTOM = 278;
  let y = 20;
  const drawBar = () => { doc.setFillColor(79, 70, 229); doc.rect(15.5, 0, 1.5, 297, 'F'); };
  const newPage = () => { doc.addPage(); drawBar(); y = 20; };
  const checkY = (h: number) => { if (y + h > BOTTOM) newPage(); };
  drawBar();

  doc.setFontSize(20); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 15, 15);
  doc.text(cv.name, ML, y); y += 7;
  doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(79, 70, 229);
  doc.text(cv.title, ML, y); y += 5;
  doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100);
  for (const cl of doc.splitTextToSize(cv.contact, CW)) { doc.text(cl, ML, y); y += 4; }
  y += 5;

  const drawHdr = (label: string) => {
    checkY(10); y += 2;
    doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(79, 70, 229);
    doc.text(label, ML, y); y += 2;
    doc.setDrawColor(79, 70, 229); doc.setLineWidth(0.4); doc.line(ML, y, ML + 20, y);
    doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.3); doc.line(ML + 20, y, PW - MR, y); y += 5;
  };

  for (const sec of cv.sections) {
    if (sec.header === 'SKILLS') {
      drawHdr('SKILLS');
      const skills = sec.lines.join(' ').split(/[|,]/).map((s: string) => s.trim()).filter(Boolean);
      let cx = ML, rowY = y;
      for (const sk of skills) {
        // Reset font before measuring each skill to get accurate width
        doc.setFontSize(8.5); doc.setFont('helvetica', 'normal');
        const tw = doc.getTextWidth(sk), cW = tw + 5;
        if (cx + cW > PW - MR) { cx = ML; rowY += 8.5; checkY(10); }
        doc.setFillColor(237, 233, 254); doc.setDrawColor(196, 181, 253); doc.setLineWidth(0.2);
        doc.roundedRect(cx, rowY, cW, 5.5, 1.2, 1.2, 'FD');
        // Re-apply font+color after fill to ensure text renders correctly
        doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(67, 56, 202);
        doc.text(sk, cx + 2.5, rowY + 4); cx += cW + 2.5;
      }
      y = rowY + 10;
    } else if (sec.header === 'EXPERIENCE') {
      checkY(38); drawHdr('EXPERIENCE');
      for (const e of parseExperience(sec.lines)) {
        checkY(30);
        doc.setFontSize(10.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 15, 15);
        doc.text(e.jobTitle, ML, y); y += 5;
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(79, 70, 229);
        const compLine = e.company + (e.location ? '  ·  ' + e.location : '') + '  ·  ' + e.dates;
        doc.text(doc.splitTextToSize(compLine, CW)[0], ML, y); y += 5;
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(55, 55, 55);
        for (const b of e.bullets) {
          const bL = doc.splitTextToSize(b, CW - 5);
          checkY(bL.length * 4.2 + 1);
          doc.setFillColor(79, 70, 229); doc.rect(ML, y - 2.5, 1.5, 1.5, 'F');
          doc.setTextColor(55, 55, 55);
          for (const bl of bL) { doc.text(bl, ML + 4, y); y += 4.2; }
        }
        y += 4;
      }
    } else if (sec.header === 'EDUCATION') {
      checkY(38); drawHdr('EDUCATION');
      for (const e of parseEducation(sec.lines)) {
        checkY(20);
        doc.setFontSize(10.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 15, 15);
        doc.text(e.degree, ML, y); y += 5;
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(79, 70, 229);
        doc.text(e.institution + (e.location ? '  ·  ' + e.location : '') + '  ·  ' + e.dates, ML, y); y += 7;
      }
    } else {
      drawHdr(sec.header);
      doc.setFontSize(9.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(55, 55, 55);
      const j = sec.lines.filter((l: string) => l.trim()).join(' ');
      for (const wl of doc.splitTextToSize(j, CW)) { checkY(5); doc.text(wl, ML, y); y += 4.8; }
      y += 3;
    }
  }
}

function renderCleanCorporate(doc: any, text: string) {
  const cv = parseCV(text);
  const PW = 210, ML = 18, MR = 18, CW = PW - ML - MR, BOTTOM = 278;
  let y = 20;
  const newPage = () => { doc.addPage(); y = 20; };
  const checkY = (h: number) => { if (y + h > BOTTOM) newPage(); };

  doc.setFontSize(24); doc.setFont('helvetica', 'bold'); doc.setTextColor(10, 10, 10);
  doc.text(cv.name, PW / 2, y, { align: 'center' }); y += 8;
  doc.setFontSize(11); doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80);
  doc.text(cv.title, PW / 2, y, { align: 'center' }); y += 5;
  doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(120, 120, 120);
  for (const cl of doc.splitTextToSize(cv.contact, CW)) { doc.text(cl, PW / 2, y, { align: 'center' }); y += 4; }
  y += 2;
  doc.setDrawColor(30, 64, 175); doc.setLineWidth(1.5); doc.line(ML, y, PW - MR, y); y += 1.5;
  doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.4); doc.line(ML, y, PW - MR, y); y += 5;

  const drawHdr = (label: string) => {
    checkY(12); y += 2;
    doc.setFillColor(243, 244, 246); doc.rect(ML - 2, y - 4, CW + 4, 7, 'F');
    doc.setFontSize(9.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 64, 175);
    doc.text(label, ML, y); y += 7;
  };

  for (const sec of cv.sections) {
    if (sec.header === 'SKILLS') {
      drawHdr('SKILLS');
      const skills = sec.lines.join(' ').split(/[|,]/).map((s: string) => s.trim()).filter(Boolean);
      doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 50, 50);
      doc.setDrawColor(180, 180, 180); doc.setLineWidth(0.3);
      let cx = ML, rowY = y;
      for (const sk of skills) {
        const tw = doc.getTextWidth(sk), cW = tw + 5;
        if (cx + cW > PW - MR) { cx = ML; rowY += 8.5; checkY(10); }
        doc.roundedRect(cx, rowY, cW, 5.5, 1.2, 1.2, 'S');
        doc.text(sk, cx + 2.5, rowY + 4); cx += cW + 2.5;
      }
      y = rowY + 10;
    } else if (sec.header === 'EXPERIENCE') {
      checkY(38); drawHdr('EXPERIENCE');
      for (const e of parseExperience(sec.lines)) {
        checkY(30);
        doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(10, 10, 10);
        doc.text(e.jobTitle, ML, y);
        // Measure date at correct font before rendering
        doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(120, 120, 120);
        const dwExp = doc.getTextWidth(e.dates);
        doc.text(e.dates, PW - MR - dwExp, y); y += 5.5;
        doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 64, 175);
        doc.text(e.company + (e.location ? '  |  ' + e.location : ''), ML, y); y += 5;
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 50, 50);
        for (const b of e.bullets) {
          const bL = doc.splitTextToSize(b, CW - 6);
          checkY(bL.length * 4.2 + 1);
          doc.setFillColor(30, 64, 175); doc.circle(ML + 1.5, y - 1.5, 0.9, 'F');
          doc.setTextColor(50, 50, 50);
          for (const bl of bL) { doc.text(bl, ML + 4.5, y); y += 4.2; }
        }
        y += 5;
      }
    } else if (sec.header === 'EDUCATION') {
      checkY(38); drawHdr('EDUCATION');
      for (const e of parseEducation(sec.lines)) {
        checkY(20);
        doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(120, 120, 120);
        const dwEdu = doc.getTextWidth(e.dates);
        doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(10, 10, 10);
        doc.text(e.degree, ML, y);
        doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(120, 120, 120);
        doc.text(e.dates, PW - MR - dwEdu, y); y += 5.5;
        doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 64, 175);
        doc.text(e.institution + (e.location ? '  |  ' + e.location : ''), ML, y); y += 8;
      }
    } else {
      drawHdr(sec.header);
      doc.setFontSize(9.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 50, 50);
      const j = sec.lines.filter((l: string) => l.trim()).join(' ');
      for (const wl of doc.splitTextToSize(j, CW)) { checkY(5); doc.text(wl, ML, y); y += 4.8; }
      y += 3;
    }
  }
}

async function downloadAsPDF(text: string, filename: string, template = 'modern-sidebar') {
  const win = window as any;
  if (!win.jspdf) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('jsPDF load failed'));
      document.head.appendChild(s);
    });
  }
  const { jsPDF } = win.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  switch (template) {
    case 'harvard':   renderHarvard(doc, text); break;
    case 'executive': renderExecutive(doc, text); break;
    case 'tech':      renderTechMinimal(doc, text); break;
    case 'corporate': renderCleanCorporate(doc, text); break;
    default:          renderModernSidebar(doc, text); break;
  }
  doc.save(filename);
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ─────────────────────────────────────────────────────────────────────────────
// PRO UNLOCK — email + key
// ─────────────────────────────────────────────────────────────────────────────
function ProUnlockInline({ onActivate }: { onActivate: (email: string, key: string) => Promise<boolean> }) {
  const [email,   setEmail]   = useState('');
  const [key,     setKey]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  const handle = async () => {
    if (!email.trim() || !key.trim()) { setError('Ingresa tu email y clave'); return; }
    setLoading(true); setError('');
    const ok = await onActivate(email.trim(), key.trim());
    setLoading(false);
    if (ok) setSuccess(true);
    else setError('Clave inválida o email incorrecto. Contacta a Javier.');
  };

  if (success) return (
    <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
      <Star size={12} className="fill-emerald-400" /> Plan Pro activado
    </span>
  );

  return (
    <div className="flex flex-col gap-2 w-72">
      <div className="flex gap-2">
        <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
          className="flex-1 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-600 text-xs text-white placeholder-gray-500 outline-none focus:border-indigo-500"
          placeholder="Tu email..." />
        <input type="text" value={key} onChange={e => { setKey(e.target.value); setError(''); }}
          className="flex-1 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-600 text-xs text-white placeholder-gray-500 outline-none focus:border-indigo-500"
          placeholder="Clave Pro (CSS4J.xxx)..." />
      </div>
      <div className="flex items-center gap-2">
        <button onClick={handle} disabled={loading} className="btn-primary text-xs py-1.5 px-3 disabled:opacity-60">
          {loading ? 'Verificando...' : <><Lock size={10} /> Activar Pro</>}
        </button>
        {error && <span className="text-red-400 text-xs">{error}</span>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ATS CARD
// ─────────────────────────────────────────────────────────────────────────────
interface AtsData { score: number; keywords: { kw: string; exp: string }[]; recommendations: { title: string; text: string }[]; }

function AtsCard({ data }: { data: AtsData }) {
  const sc = data.score;
  const scoreColor  = sc >= 80 ? 'text-emerald-400' : sc >= 60 ? 'text-amber-400' : 'text-red-400';
  const scoreBorder = sc >= 80 ? 'border-emerald-500/40 bg-emerald-500/10' : sc >= 60 ? 'border-amber-500/40 bg-amber-500/10' : 'border-red-500/40 bg-red-500/10';
  const scoreRing   = sc >= 80 ? 'ring-emerald-500/30' : sc >= 60 ? 'ring-amber-500/30' : 'ring-red-500/30';
  return (
    <div className="mt-6 card border border-amber-500/20 bg-amber-500/5">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-amber-400" />
          <span className="font-bold text-white text-sm tracking-wide">ATS MATCH ANALYSIS</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase">Private</span>
        </div>
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ring-2 ${scoreBorder} ${scoreRing}`}>
          <div className="text-right">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Match Score</div>
            <div className={`text-3xl font-black leading-none ${scoreColor}`}>{sc}<span className="text-lg">%</span></div>
          </div>
        </div>
      </div>
      <div className="mb-5">
        <h3 className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
          <Key size={11} className="text-indigo-400" /> Top 5 Keywords Matched
        </h3>
        <div className="space-y-2">
          {data.keywords.map((kw, i) => (
            <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-800/60 border border-gray-700/50">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              <div><span className="text-white text-xs font-semibold">{kw.kw}</span><p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{kw.exp}</p></div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
          <TrendingUp size={11} className="text-amber-400" /> Top 3 Recommendations
        </h3>
        <div className="space-y-2">
          {data.recommendations.map((rec, i) => (
            <div key={i} className="p-3 rounded-lg bg-gray-800/60 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <span className="text-white text-xs font-bold">{rec.title}</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed ml-6">{rec.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function CVTailoringPage() {
  const { t }                                     = useLang();
  const { isPro, ready, cvLimit, cvUsed, canGenerate, recordCVUse, activatePro } = usePro();

  const [cvText, setCvText]                       = useState('');
  const [jobDesc, setJobDesc]                     = useState('');
  const [result, setResult]                       = useState('');
  const [atsData, setAtsData]                     = useState<AtsData | null>(null);
  const [loading, setLoading]                     = useState(false);
  const [error, setError]                         = useState('');
  const [copied, setCopied]                       = useState(false);
  const [language, setLanguage]                   = useState('es');
  const [activeTab, setActiveTab]                 = useState<'paste' | 'upload'>('paste');
  const [pdfLoading, setPdfLoading]               = useState(false);
  const [showProForm, setShowProForm]             = useState(false);

  // Template + preview
  const [selectedTemplate, setSelectedTemplate]   = useState('modern-sidebar');
  const [viewMode, setViewMode]                   = useState<'preview' | 'text'>('preview');

  // Cover letter
  const [clResult, setClResult]                   = useState('');
  const [clLoading, setClLoading]                 = useState(false);
  const [clError, setClError]                     = useState('');
  const [clCopied, setClCopied]                   = useState(false);
  const [clPdfLoading, setClPdfLoading]           = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvText(await file.text());
    setActiveTab('paste');
  };

  const handleSubmit = async () => {
    if (!cvText.trim() || !jobDesc.trim()) { setError(t('cv_error')); return; }
    if (!canGenerate) {
      setError(`Has usado ${cvUsed}/${cvLimit} CVs este mes. Tu cuota se renueva el 1 del próximo mes.`);
      return;
    }
    setError(''); setResult(''); setAtsData(null); setClResult('');
    setLoading(true);
    try {
      const res  = await fetch('/api/tailor-cv', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ cvText, jobDescription: jobDesc, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setResult(data.tailoredCV || '');
      setAtsData({
        score:           Number(data.atsScore) || 0,
        keywords:        Array.isArray(data.atsKeywords)        ? data.atsKeywords        : [],
        recommendations: Array.isArray(data.atsRecommendations) ? data.atsRecommendations : [],
      });
      recordCVUse();
      setViewMode('preview'); // switch to preview on result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const copyResult  = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const downloadTxt = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([result], { type: 'text/plain;charset=utf-8' }));
    a.download = 'CV-CSS4JOBS.txt'; a.click();
  };
  const downloadCVPDF = async () => {
    setPdfLoading(true);
    try { await downloadAsPDF(result, 'CV-CSS4JOBS.pdf', selectedTemplate); }
    catch { alert('Error generando PDF.'); }
    finally { setPdfLoading(false); }
  };

  const handleActivatePro = async (email: string, key: string) => {
    const r = await activatePro(email, key);
    return r.success;
  };

  const generateCoverLetter = async () => {
    if (!result.trim() || !jobDesc.trim()) return;
    setClError(''); setClResult(''); setClLoading(true);
    try {
      const res  = await fetch('/api/generate-cover-letter', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ cvText: result, jobDescription: jobDesc, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setClResult(data.coverLetter);
    } catch (err) { setClError(err instanceof Error ? err.message : 'Error'); }
    finally { setClLoading(false); }
  };
  const copyClResult = () => { navigator.clipboard.writeText(clResult); setClCopied(true); setTimeout(() => setClCopied(false), 2000); };
  const downloadClPDF = async () => {
    setClPdfLoading(true);
    try { await downloadAsPDF(clResult, 'CoverLetter-CSS4JOBS.pdf', 'harvard'); }
    catch { alert('Error generando PDF.'); }
    finally { setClPdfLoading(false); }
  };

  const Spinner = ({ size = 'h-5 w-5' }: { size?: string }) => (
    <svg className={`animate-spin ${size}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );

  // CV usage badge
  const usageBadge = ready ? (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${
      canGenerate
        ? 'border-gray-700 text-gray-500 bg-gray-800/50'
        : 'border-red-500/40 text-red-400 bg-red-500/10'
    }`}>
      {cvUsed}/{cvLimit === 999 ? '∞' : cvLimit} CVs este mes
    </span>
  ) : null;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Zap size={12} /> {t('cv_badge')}
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">{t('cv_h1')}</h1>
          <p className="text-gray-400 max-w-xl mx-auto">{t('cv_desc')}</p>
        </div>

        {/* Input grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            {/* CV input */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <FileText size={16} className="text-indigo-400" /> {t('cv_label')}
                </h2>
                <div className="flex gap-1">
                  <button onClick={() => setActiveTab('paste')} className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${activeTab === 'paste' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                    <Clipboard size={12} className="inline mr-1" />{t('cv_paste')}
                  </button>
                  <button onClick={() => fileRef.current?.click()} className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${activeTab === 'upload' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                    <Upload size={12} className="inline mr-1" />{t('cv_upload')}
                  </button>
                  <input ref={fileRef} type="file" accept=".txt,.pdf,.doc,.docx" className="hidden" onChange={handleFile} />
                </div>
              </div>
              <textarea value={cvText} onChange={e => setCvText(e.target.value)} className="textarea" rows={14} placeholder={t('cv_placeholder')} />
              <p className="text-xs text-gray-600 mt-2">{cvText.length} chars</p>
            </div>
            {/* Language */}
            <div className="card py-4">
              <label className="text-sm font-semibold text-gray-300 mb-3 block">{t('cv_lang_label')}</label>
              <div className="flex gap-2">
                {[{ v: 'es', label: '🇪🇸 Español' }, { v: 'en', label: '🇬🇧 English' }, { v: 'pt', label: '🇧🇷 Português' }].map(l => (
                  <button key={l.v} onClick={() => setLanguage(l.v)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${language === l.v ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Job description */}
          <div className="card">
            <h2 className="font-bold text-white flex items-center gap-2 mb-4">
              <FileText size={16} className="text-emerald-400" /> {t('cv_job_label')}
            </h2>
            <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)} className="textarea" rows={18} placeholder={t('cv_job_placeholder')} />
            <p className="text-xs text-gray-600 mt-2">{jobDesc.length} chars</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <button onClick={handleSubmit} disabled={loading || !canGenerate}
            className="btn-primary text-base px-10 py-4 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <><Spinner /> {t('cv_loading')}</> : <><Zap size={18} /> {t('cv_submit')}</>}
          </button>
          {ready && usageBadge}
        </div>

        {/* ── RESULT ───────────────────────────────────────────────────────── */}
        {result && (
          <div className="mt-10">

            {/* ── Template selector ──────────────────────────────────────── */}
            <div className="card mb-4 border border-indigo-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Layout size={14} className="text-indigo-400" />
                <span className="text-white font-bold text-sm">Diseño del CV</span>
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-bold">Vista previa gratis · PDF con Pro</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {TEMPLATES.map(tpl => (
                  <button key={tpl.id} onClick={() => setSelectedTemplate(tpl.id)}
                    className={`relative p-3 rounded-xl border text-left transition-all ${
                      selectedTemplate === tpl.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}>
                    {/* Mini color dot */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div style={{ background: tpl.dot }} className="w-3 h-3 rounded-full flex-shrink-0" />
                      {selectedTemplate === tpl.id && <CheckCircle size={10} className="text-indigo-400 flex-shrink-0" />}
                    </div>
                    <p className="text-white text-xs font-semibold leading-tight">{tpl.name}</p>
                    <p className="text-gray-500 text-[10px] mt-0.5 leading-tight">{tpl.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Result header + actions ─────────────────────────────────── */}
            <div className="card">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-400" /> {t('cv_result_title')}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* View mode toggle */}
                  <div className="flex rounded-lg overflow-hidden border border-gray-700">
                    <button onClick={() => setViewMode('preview')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all ${viewMode === 'preview' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                      <Eye size={12} /> Vista previa
                    </button>
                    <button onClick={() => setViewMode('text')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all ${viewMode === 'text' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                      <AlignLeft size={12} /> Texto
                    </button>
                  </div>
                  <button onClick={copyResult} className="btn-outline text-xs py-1.5 px-3">
                    {copied ? <><CheckCircle size={12} /> {t('cv_copied')}</> : <><Copy size={12} /> {t('cv_copy')}</>}
                  </button>
                  <button onClick={downloadTxt} className="btn-outline text-xs py-1.5 px-3">
                    <Download size={12} /> {t('cv_download')}
                  </button>
                  {/* PDF — Pro only */}
                  {ready && (
                    isPro ? (
                      <button onClick={downloadCVPDF} disabled={pdfLoading} className="btn-primary text-xs py-1.5 px-3 disabled:opacity-60">
                        {pdfLoading ? <><Spinner size="h-3 w-3" /> PDF...</> : <><Download size={12} /> {t('cv_download_pdf')}</>}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        {!showProForm ? (
                          <button onClick={() => setShowProForm(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-600 text-xs text-gray-400 hover:border-indigo-500 hover:text-indigo-400 transition-all">
                            <Lock size={11} /> {t('cv_download_pdf')}
                            <span className="ml-1 px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-bold">{t('pro_locked_label')}</span>
                          </button>
                        ) : (
                          <ProUnlockInline onActivate={handleActivatePro} />
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Content: preview or plain text */}
              {viewMode === 'preview' ? (
                <div className="rounded-xl overflow-auto bg-gray-200 p-4" style={{ maxHeight: 700 }}>
                  <Suspense fallback={<div className="text-gray-400 text-sm text-center py-20">Cargando vista previa...</div>}>
                    <CVPreview text={result} template={selectedTemplate} />
                  </Suspense>
                </div>
              ) : (
                <pre className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-mono bg-gray-800/50 rounded-xl p-6 max-h-[700px] overflow-y-auto">{result}</pre>
              )}
            </div>
          </div>
        )}

        {/* ATS Card */}
        {result && atsData && <AtsCard data={atsData} />}

        {/* Cover Letter */}
        {result && (
          <div className="mt-6 card border-2 border-indigo-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                <Mail size={17} className="text-indigo-400" />
              </div>
              <div>
                <h2 className="font-bold text-white">{t('cl_title')}</h2>
                <p className="text-gray-500 text-xs">{t('cl_desc')}</p>
              </div>
            </div>
            {clError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-xs">{clError}</p>
              </div>
            )}
            {!clResult && ready && (
              isPro ? (
                <button onClick={generateCoverLetter} disabled={clLoading}
                  className="btn-primary w-full justify-center py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  {clLoading ? <><Spinner size="h-4 w-4" /> {t('cl_loading')}</> : <><Mail size={15} /> {t('cl_generate')}</>}
                </button>
              ) : (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                    <Lock size={20} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t('cl_title')} — Plan Pro</p>
                    <p className="text-gray-500 text-xs mt-1">Inicia sesión con tu clave Pro para generar cartas de presentación personalizadas.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowProForm(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
                    >
                      <Lock size={11} /> Activar Pro
                    </button>
                    <a href="/pricing" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 hover:border-indigo-500/50 text-gray-300 hover:text-white text-xs font-semibold transition-all">
                      Ver planes →
                    </a>
                  </div>
                </div>
              )
            )}
            {clResult && (
              <div>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <span className="text-sm font-semibold text-white flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400" /> {t('cl_result_title')}
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={copyClResult} className="btn-outline text-xs py-1.5 px-3">
          