'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Offcanvas, Spinner } from 'react-bootstrap';
import {
  BsCalendarEvent,
  BsCheck2Circle,
  BsCheckCircle,
  BsChevronRight,
  BsPeople,
  BsPersonPlus,
  BsQuestionCircle,
  BsSpeaker,
  BsX
} from 'react-icons/bs';
import { getDashboardAggregateValue } from '../../../../utils/helpers';
import { CHURCH } from '../../../../utils/apiUrl';
import { zat } from '../../../../utils/api';
import { VERBS } from '../../../../config';
import { TotalInvested, NumberofInvested, Portfoliovalue, Returnsrate } from '../../../share/chart';
import RecentMembers from '../recentMembers';
import AttendanceChart from '../../../share/aChart';

/* ─────────────────────────────────────────────────────────── config ─── */

// Explicit color map so tinted icon circles render correctly regardless of
// whether the app's theme defines custom "bg-{tone}-transparent" utility
// classes. Solid KPI avatar colors (bg-info/bg-secondary/etc.) are real
// Bootstrap classes and were already rendering fine, so those are untouched.
const TONE_TINT = {
  primary:   { bg: '#E7EEFF', fg: '#2F5AF0' },
  secondary: { bg: '#F1F2F6', fg: '#64748B' },
  purple:    { bg: '#EFEAFB', fg: '#7C4DFF' },
  warning:   { bg: '#FEF0DE', fg: '#F2994A' },
  success:   { bg: '#E9F9EF', fg: '#16A34A' },
  info:      { bg: '#E7EEFF', fg: '#2F5AF0' }
};

const FEATURE_BUTTON_TONE = {
  primary: {
    bg: '#2F5AF0',
    hover: '#2449CA',
    active: '#1D3EA8'
  },
  success: {
    bg: '#16A34A',
    hover: '#15803D',
    active: '#166534'
  },
  warning: {
    bg: '#C76B12',
    hover: '#B55F0F',
    active: '#94450E'
  }
};

// Explicit fallback so Cards read as distinct boxed panels even if the
// surrounding app's theme overrides/removes Bootstrap's shadow-sm.
const CARD_STYLE = { borderRadius: 16, border: '1px solid #EEF0F5', boxShadow: '0 1px 3px rgba(16, 24, 40, 0.06)' };

const KPI_CONFIG = [
  {
    key: 'members',
    label: 'Total Members',
    sub: 'Total registered',
    iconClass: 'bi bi-boxes text-white fs-16',
    avatarTone: 'bg-info',
    Sparkline: TotalInvested
  },
  {
    key: 'upcomingEvents',
    label: 'Upcoming Events',
    sub: 'Scheduled events',
    iconClass: 'bi bi-check-circle text-white fs-16',
    avatarTone: 'bg-secondary',
    Sparkline: NumberofInvested
  },
  {
    key: 'fellowships',
    label: 'Fellowship Groups',
    sub: 'Active groups',
    iconClass: 'bi bi-bootstrap-reboot fs-16',
    avatarTone: 'bg-warning',
    Sparkline: Portfoliovalue
  },
  {
    key: 'peakAttendance',
    label: 'Peak Attendance',
    sub: 'Record high',
    iconClass: 'bi bi-stopwatch text-white fs-19',
    avatarTone: 'bg-success',
    Sparkline: Returnsrate
  }
];

const QUICK_ACTIONS = [
  { title: 'Add Member', description: 'Register a new church member', href: '/protected/church/members', icon: BsPersonPlus, tone: 'primary' },
  { title: 'Create Service', description: 'Plan a new church service', href: '/protected/church/regular-services', icon: BsCalendarEvent, tone: 'purple' },
  { title: 'Add Event', description: 'Schedule a church event', href: '/protected/church/events/create', icon: BsCalendarEvent, tone: 'warning' },
  { title: 'Add Sermon', description: 'Upload a new sermon', href: '/protected/church/sermons', icon: BsSpeaker, tone: 'success' },
  { title: 'Record Attendance', description: 'Take attendance for a service', href: '/protected/church/attendance', icon: BsCheckCircle, tone: 'info' }
];

const FLAT_SETUP_TASKS = [
  { key: 'churchProfile',  label: 'Add Church Information',    href: '/protected/church/settings' },
  { key: 'firstService',  label: 'Create Your First Service',  href: '/protected/church/regular-services' },
  { key: 'members',       label: 'Add Members',                href: '/protected/church/members' },
  { key: 'leaders',       label: 'Add Pastors / Leaders',      href: '/protected/church/members' },
  { key: 'fellowships',   label: 'Create Fellowship Groups',   href: '/protected/church/fellowships' },
  { key: 'attendance',    label: 'Record Your First Attendance', href: '/protected/church/attendance' },
  { key: 'sermons',       label: 'Add Your First Sermon',      href: '/protected/church/sermons' }
];

const SETUP_GUIDE_SECTIONS = [
  {
    title: 'Church Information',
    purpose: 'Configure your church details.',
    icon: BsCheckCircle,
    tone: 'primary',
    items: ['Church Name', 'Address', 'Time Zone', 'Contact Details'],
    itemStyle: 'check',
    buttonLabel: 'Go to Settings',
    href: '/protected/church/settings'
  },
  {
    title: 'Create Your First Service',
    purpose: 'Services are required for attendance and sermons.',
    icon: BsCalendarEvent,
    tone: 'purple',
    items: ['Sunday Service', 'Bible Study', 'Prayer Meeting'],
    itemStyle: 'bullet',
    buttonLabel: 'Go to Services',
    href: '/protected/church/regular-services'
  },
  {
    title: 'Add Members',
    purpose: 'Import or register your church members.',
    icon: BsPeople,
    tone: 'info',
    noteLabel: 'Recommended',
    note: 'Start with pastors and leaders.',
    buttonLabel: 'Go to Members',
    href: '/protected/church/members'
  },
  {
    title: 'Record Attendance',
    purpose: 'Attendance powers:',
    icon: BsCheck2Circle,
    tone: 'success',
    items: ['Dashboard', 'Pastoral Care', 'Reports'],
    itemStyle: 'bullet',
    buttonLabel: 'Go to Attendance',
    href: '/protected/church/attendance'
  },
  {
    title: 'Fellowship Groups (Optional)',
    purpose: 'Create home cells or fellowship groups.',
    icon: BsPeople,
    tone: 'warning',
    note: 'This can be completed later.',
    buttonLabel: 'Go to Fellowships',
    href: '/protected/church/fellowships'
  },
  {
    title: 'Upload Sermons (Optional)',
    purpose: 'Upload sermons for members to listen to from the mobile app.',
    icon: BsSpeaker,
    tone: 'secondary',
    noteLabel: 'Supported',
    items: ['YouTube', 'Audio URL', 'Video URL'],
    itemStyle: 'bullet',
    buttonLabel: 'Go to Sermons',
    href: '/protected/church/sermons'
  }
];

const DEFAULT_ONBOARDING = {
  dismissed: false,
  setupChecklistDismissed: false,
  completedCount: 0,
  totalCount: 7,
  percentage: 0,
  completed: false,
  tasks: { churchProfile: false, firstService: false, members: false, leaders: false, fellowships: false, attendance: false, sermons: false }
};

/* Bottom-right onboarding tour: 5 short stops introducing the shell. Only
   the first stop's target (this Dashboard page) lives in this file — steps
   2–5 are placeholder copy for whichever pages/panels those stops belong to. */
const TOUR_STEPS = [
  { title: 'This is your Dashboard', body: 'Here you can see an overview of your church activities and important stats.' },
  { title: 'Track Your Growth', body: 'Keep an eye on membership, events, and attendance trends at a glance.' },
  { title: 'Quick Actions', body: 'Jump straight into adding members, services, events, and sermons.' },
  { title: 'Setup Progress', body: 'Follow the checklist on the right to finish setting up your church workspace.' },
  { title: 'Recent Members', body: 'See who just joined and manage their records from here.' }
];

const TOUR_STORAGE_KEY = 'jerur.dashboardTour.dismissed';

/* ──────────────────────────────────────────────────────────── helpers ─── */

/* Small reusable tinted circle icon badge — inline-styled so it renders
   identically regardless of whether the app's theme defines
   bg-{tone}-transparent utility classes. */
const TintIcon = ({ icon: Icon, tone = 'primary', size = 36, iconSize = 16, shape = 'circle' }) => {
  const { bg, fg } = TONE_TINT[tone] || TONE_TINT.primary;
  return (
    <span
      className="d-inline-flex align-items-center justify-content-center shrink-0"
      style={{ width: size, height: size, borderRadius: shape === 'square' ? 14 : '50%', background: bg, color: fg, fontSize: iconSize }}
    >
      <Icon />
    </span>
  );
};

const JerurFeatureButton = ({ title, onClick, tone = 'primary', block = false }) => {
  const colors = FEATURE_BUTTON_TONE[tone] || FEATURE_BUTTON_TONE.primary;

  return (
    <Button
      type="button"
      onClick={onClick}
      className={block ? 'w-100' : ''}
      style={{
        '--bs-btn-color': '#fff',
        '--bs-btn-bg': colors.bg,
        '--bs-btn-border-color': colors.bg,
        '--bs-btn-hover-color': '#fff',
        '--bs-btn-hover-bg': colors.hover,
        '--bs-btn-hover-border-color': colors.hover,
        '--bs-btn-focus-shadow-rgb': tone === 'warning' ? '199, 107, 18' : tone === 'success' ? '22, 163, 74' : '47, 90, 240',
        '--bs-btn-active-color': '#fff',
        '--bs-btn-active-bg': colors.active,
        '--bs-btn-active-border-color': colors.active,
        '--bs-btn-disabled-color': '#fff',
        '--bs-btn-disabled-bg': colors.bg,
        '--bs-btn-disabled-border-color': colors.bg,
        fontWeight: 600,
        fontSize: 13,
        borderRadius: 8,
        padding: '8px 18px'
      }}
    >
      {title}
    </Button>
  );
};

// Inline SVG church illustration matching the mock — used instead of the
// app's generic /img/illustrations/i2.png asset, which is a different
// (rocket/laptop) graphic and doesn't match the reference design.
const ChurchIllustration = ({ width = 150 }) => (
  <svg viewBox="0 0 220 150" width={width} style={{ display: 'block' }} fill="none">
    <rect width="220" height="150" rx="12" fill="#EAF1FF" />
    {/* cloud + bird */}
    <ellipse cx="168" cy="34" rx="20" ry="11" fill="#fff" opacity="0.8" />
    <ellipse cx="182" cy="30" rx="14" ry="9" fill="#fff" opacity="0.8" />
    <path d="M50 40 q6 -6 12 0 q6 -6 12 0" stroke="#6B8BD4" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* grass */}
    <rect x="0" y="128" width="220" height="22" fill="#BFE0BE" />
    {/* trees */}
    <rect x="42" y="108" width="6" height="22" fill="#7FA66B" />
    <circle cx="45" cy="100" r="16" fill="#9BCF9A" />
    <rect x="168" y="112" width="6" height="18" fill="#7FA66B" />
    <circle cx="171" cy="105" r="13" fill="#9BCF9A" />
    {/* church body */}
    <rect x="78" y="72" width="60" height="56" fill="#FDFEFF" stroke="#B9C6E8" strokeWidth="1" />
    <polygon points="78,72 108,48 138,72" fill="#43599E" />
    {/* steeple */}
    <rect x="102" y="24" width="12" height="24" fill="#43599E" />
    <polygon points="102,24 108,12 114,24" fill="#43599E" />
    <rect x="107" y="6" width="2" height="10" fill="#43599E" />
    <rect x="103" y="9" width="10" height="2" fill="#43599E" />
    {/* door */}
    <path d="M100 128 v-24 a8 8 0 0 1 16 0 v24 z" fill="#43599E" />
    {/* window */}
    <circle cx="122" cy="90" r="6" fill="#C9D5F2" stroke="#43599E" strokeWidth="1.5" />
  </svg>
);

const WelcomeIllustration = ({ size = 170 }) => (
  <svg viewBox="0 0 220 220" width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>
    <defs>
      <clipPath id="welcomeCircleClip">
        <circle cx="110" cy="110" r="100" />
      </clipPath>
    </defs>
    <circle cx="110" cy="110" r="100" fill="#E7EEFB" />
    <g clipPath="url(#welcomeCircleClip)">
      {/* clouds */}
      <ellipse cx="52" cy="55" rx="18" ry="10" fill="#fff" opacity="0.9" />
      <ellipse cx="165" cy="45" rx="20" ry="11" fill="#fff" opacity="0.9" />
      {/* confetti */}
      <rect x="35" y="90" width="6" height="6" fill="#F2994A" transform="rotate(20 35 90)" />
      <rect x="180" y="80" width="6" height="6" fill="#EF4444" transform="rotate(-15 180 80)" />
      <circle cx="60" cy="130" r="4" fill="#2F5AF0" />
      <circle cx="170" cy="140" r="4" fill="#16A34A" />
      <rect x="45" y="160" width="5" height="5" fill="#F2994A" transform="rotate(10 45 160)" />
      <circle cx="150" cy="60" r="3.5" fill="#7C4DFF" />
      <path d="M30 110 q10 15 0 30" stroke="#8AB4F8" strokeWidth="2" fill="none" />
      <path d="M190 115 q-10 15 0 30" stroke="#8AB4F8" strokeWidth="2" fill="none" />

      {/* church, centered/scaled up from ChurchIllustration */}
      <g transform="translate(50, 60) scale(1.35)">
        <rect x="30" y="52" width="60" height="56" fill="#FDFEFF" stroke="#B9C6E8" strokeWidth="1" />
        <polygon points="30,52 60,28 90,52" fill="#43599E" />
        <rect x="54" y="4" width="12" height="24" fill="#43599E" />
        <polygon points="54,4 60,-8 66,4" fill="#43599E" />
        <rect x="59" y="-14" width="2" height="10" fill="#43599E" />
        <rect x="55" y="-11" width="10" height="2" fill="#43599E" />
        <path d="M52 108 v-24 a8 8 0 0 1 16 0 v24 z" fill="#43599E" />
        <circle cx="74" cy="70" r="6" fill="#C9D5F2" stroke="#43599E" strokeWidth="1.5" />
      </g>
    </g>
  </svg>
);

/* ──────────────────────────────────────────────────────── presentational ─── */

const KpiCard = ({ label, sub, value, iconClass, avatarTone, Sparkline }) => (
  <div className="col-sm-6 col-xl-3">
    <Card className="border-0" style={CARD_STYLE}>
      <Card.Body className="p-3 p-xl-4">
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div className="d-flex align-items-start gap-3">
            <span className={`avatar avatar-rounded ${avatarTone}`}>
              <i className={iconClass}></i>
            </span>
            <div>
              <div className="text-muted small mb-1">{label}</div>
              <div className="fs-3 fw-bold mb-1" style={{ letterSpacing: '-0.03em' }}>{value}</div>
              {sub ? <div className="text-muted" style={{ fontSize: 12 }}>{sub}</div> : null}
            </div>
          </div>
          {/* Constrained so the sparkline can't break out of the card */}
          <div className="d-none d-md-block" style={{ width: 90, height: 32, overflow: 'hidden', flexShrink: 0 }}>
            {Sparkline ? <Sparkline /> : null}
          </div>
        </div>
      </Card.Body>
    </Card>
  </div>
);

const ChecklistRow = ({ task, onboarding, onNavigate }) => {
  const completed = Boolean(onboarding.tasks?.[task.key]);
  return (
    <button
      type="button"
      onClick={() => onNavigate(task.href)}
      aria-label={task.label}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        textAlign: 'left',
        gap: 8,
        width: '100%',
        whiteSpace: 'nowrap',
        background: 'transparent',
        border: 'none',
        padding: 0,
        marginBottom: 12,
        cursor: 'pointer'
      }}
    >
      <span
        style={{
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 18,
          height: 18,
          borderRadius: '50%',
          color: completed ? '#16A34A' : '#9CA3AF'
        }}
        aria-hidden="true"
      >
        {completed ? <BsCheck2Circle style={{ fontSize: 18 }} /> : <span style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid #C7CCDC' }} />}
      </span>
      <span style={{ fontSize: 13.5, fontWeight: completed ? 600 : 400, color: completed ? '#16213E' : '#6B7280' }}>
        {task.label}
      </span>
    </button>
  );
};

const SetupChecklistCard = ({ onboarding, onNavigate, onDismiss, onOpenGuide, checklistRef }) => {
  const leftCol  = FLAT_SETUP_TASKS.slice(0, 4);
  const rightCol = FLAT_SETUP_TASKS.slice(4);

  return (
    <div
      ref={checklistRef}
      className="mt-3 mt-xl-4"
      style={{
        ...CARD_STYLE,
        background: '#EEF2FF',
        border: '1px solid #C7D2FE',
        padding: 24,
        position: 'relative'
      }}
    >
      {/* Scoped CSS: 2-column checklist by default, true 3-column CSS Grid
          from 1200px up. Plain media query + own classnames on purpose —
          not relying on Bootstrap's d-xl-* display utilities, which have
          been unreliable in this app (see PurgeCSS note from earlier). */}
      <style>{`
        .jerur-checklist-2col { display: flex; gap: 40px; }
        .jerur-checklist-3col { display: none; }
        @media (min-width: 1200px) {
          .jerur-checklist-2col { display: none; }
          .jerur-checklist-3col {
            display: grid;
            grid-auto-flow: column;
            grid-template-rows: repeat(3, auto);
            grid-template-columns: repeat(3, minmax(150px, auto));
            column-gap: 36px;
            row-gap: 4px;
          }
        }
        .jerur-setup-half2 {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 32px;
          flex: 1 1 50%;
          min-width: 0;
          flex-wrap: wrap;
        }
        @media (max-width: 767px) {
          .jerur-setup-half2 {
            flex-direction: column;
            align-items: stretch;
          }
          .jerur-setup-half2 > * { width: 100%; }
        }
      `}</style>

      {/* Dismiss button — pinned to the card corner, independent of content flow */}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss setup checklist"
        style={{
          position: 'absolute',
          top: 16,
          right: 18,
          border: 'none',
          background: 'transparent',
          color: '#6B7280',
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <BsX style={{ fontSize: 18 }} />
      </button>

      {/* Single flex row: illustration | [progress column 50%] | [checklist + button, evenly spaced, 50%] */}
      <div className="d-flex flex-column flex-xl-row align-items-xl-center" style={{ gap: 28 }}>

        {/* Illustration */}
        <div className="d-none d-lg-block" style={{ flexShrink: 0, width: 150 }}>
          <ChurchIllustration width={150} />
        </div>

        {/* Everything else splits the remaining row width 50/50 */}
        <div className="d-flex flex-column flex-xl-row align-items-xl-center" style={{ flex: '1 1 0%', gap: 28, minWidth: 0 }}>

          {/* Title + progress bar — exactly half the remaining width */}
          <div style={{ flex: '1 1 50%', minWidth: 260 }}>
            <h5 className="mb-1 fw-bold">Complete Your Church Setup 👋</h5>
            <p className="text-muted small mb-3">Follow these simple steps to get the most out of Jerur.</p>

            <div style={{ height: 8, borderRadius: 999, background: '#DCE1F0', overflow: 'hidden', marginBottom: 6 }}>
              <div
                style={{
                  height: '100%',
                  width: `${onboarding.percentage}%`,
                  background: '#2F5AF0',
                  borderRadius: 999,
                  transition: 'width 0.3s ease'
                }}
                role="progressbar"
                aria-valuenow={onboarding.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Church setup completion progress"
              />
            </div>
            <div className="d-flex justify-content-between" style={{ fontSize: 12.5, color: '#6B7280' }}>
              <span>{onboarding.completedCount} of {onboarding.totalCount} Complete</span>
              <span>{onboarding.percentage}%</span>
            </div>
          </div>

          {/* Checklist panel + button — evenly spaced/centered in the second half on desktop, stacked full-width on mobile */}
          <div className="jerur-setup-half2">
            <div style={{ background: '#fff', borderRadius: 14, padding: '18px 28px', maxWidth: '100%', overflowX: 'auto' }}>
              {/* 2-column version (default / below 1200px) */}
              <div className="jerur-checklist-2col">
                <div>
                  {leftCol.map((task) => <ChecklistRow key={task.key} task={task} onboarding={onboarding} onNavigate={onNavigate} />)}
                </div>
                <div>
                  {rightCol.map((task) => <ChecklistRow key={task.key} task={task} onboarding={onboarding} onNavigate={onNavigate} />)}
                </div>
              </div>

              {/* 3-column version (1200px and up) */}
              <div className="jerur-checklist-3col">
                {FLAT_SETUP_TASKS.map((task) => (
                  <ChecklistRow key={task.key} task={task} onboarding={onboarding} onNavigate={onNavigate} />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenGuide}
              style={{
                whiteSpace: 'nowrap',
                borderRadius: 8,
                border: '1.5px solid #2F5AF0',
                background: '#fff',
                color: '#2F5AF0',
                fontWeight: 600,
                fontSize: 13.5,
                padding: '10px 20px',
                flexShrink: 0
              }}
            >
              View Setup Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SetupGuideCard = ({ section, onNavigate }) => {
  const Icon = section.icon;
  const showItems = Array.isArray(section.items) && section.items.length > 0;
  const showNote = Boolean(section.note);

  return (
    <div
      style={{
        ...CARD_STYLE,
        background: '#fff',
        padding: 20
      }}
    >
      <div className="d-flex align-items-start gap-3 mb-3">
        <TintIcon icon={Icon} tone={section.tone} size={44} iconSize={18} shape="square" />
        <div>
          <h6 className="fw-bold mb-1" style={{ fontSize: 15 }}>{section.title}</h6>
          <p className="text-muted mb-0" style={{ fontSize: 13, lineHeight: 1.5 }}>{section.purpose}</p>
        </div>
      </div>

      {showItems ? (
        <div className="mb-3 d-flex flex-column" style={{ gap: 9 }}>
          {section.items.map((item) => (
            <div key={item} className="d-flex align-items-center gap-2" style={{ color: '#475467', fontSize: 13.5 }}>
              {section.itemStyle === 'check' ? (
                <span style={{ color: '#16A34A', lineHeight: 0 }}>
                  <BsCheck2Circle style={{ fontSize: 14 }} />
                </span>
              ) : (
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#98A2B3', flexShrink: 0 }} />
              )}
              <span>{item}</span>
            </div>
          ))}
        </div>
      ) : null}

      {showNote ? (
        <div
          className="mb-3 rounded-3"
          style={{
            background: '#F8FAFC',
            border: '1px solid #EAECF0',
            padding: '10px 12px'
          }}
        >
          {section.noteLabel ? (
            <div className="fw-semibold mb-1" style={{ fontSize: 12, color: '#344054' }}>{section.noteLabel}</div>
          ) : null}
          <div style={{ fontSize: 13, color: '#667085' }}>{section.note}</div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => onNavigate(section.href)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: '#F8FAFF',
          border: '1px solid #D6E4FF',
          color: '#2F5AF0',
          fontWeight: 600,
          fontSize: 13,
          borderRadius: 10,
          padding: '10px 14px'
        }}
      >
        <span>{section.buttonLabel}</span>
        <BsChevronRight style={{ fontSize: 12 }} />
      </button>
    </div>
  );
};

const SetupGuideDrawer = ({ show, onClose, onNavigate }) => (
  <Offcanvas
    show={show}
    onHide={onClose}
    placement="end"
    style={{ width: 'min(480px, 100vw)', backgroundColor: '#F8FAFC' }}
  >
    <style>{`
      .jerur-setup-guide-drawer .offcanvas-header,
      .jerur-setup-guide-drawer .offcanvas-body {
        flex-shrink: 0;
      }
      .jerur-setup-guide-scroll {
        scrollbar-width: thin;
        scrollbar-color: #C7CCDC #EEF2F6;
      }
      .jerur-setup-guide-scroll::-webkit-scrollbar {
        width: 8px;
      }
      .jerur-setup-guide-scroll::-webkit-scrollbar-track {
        background: #EEF2F6;
        border-radius: 999px;
      }
      .jerur-setup-guide-scroll::-webkit-scrollbar-thumb {
        background: #C7CCDC;
        border-radius: 999px;
        border: 2px solid #EEF2F6;
      }
      .jerur-setup-guide-scroll::-webkit-scrollbar-thumb:hover {
        background: #B5BDCF;
      }
    `}</style>
    <Offcanvas.Header closeButton className="align-items-start px-4 pt-4 pb-3" style={{ borderBottom: '1px solid #EAECF0', background: '#F8FAFC', position: 'sticky', top: 0, zIndex: 2 }}>
      <Offcanvas.Title as="div" className="pe-4">
        <div className="fw-bold" style={{ fontSize: 24, color: '#101828', letterSpacing: '-0.03em' }}>Getting Started with Jerur</div>
        <div className="text-muted mt-1" style={{ fontSize: 13.5, lineHeight: 1.5 }}>
          Complete these steps to prepare your church for daily use.
        </div>
      </Offcanvas.Title>
    </Offcanvas.Header>

    <Offcanvas.Body className="jerur-setup-guide-drawer p-0 d-flex flex-column overflow-hidden" style={{ minHeight: 0 }}>
      <div
        className="jerur-setup-guide-scroll grow overflow-auto px-4 pt-4"
        style={{
          minHeight: 0,
          paddingBottom: 28,
          scrollBehavior: 'smooth',
          overscrollBehavior: 'contain'
        }}
      >
        <div
          className="rounded-4 mb-4"
          style={{
            background: 'linear-gradient(135deg, #E7EEFF 0%, #F8FAFF 100%)',
            border: '1px solid #D6E4FF',
            padding: 20
          }}
        >
          <div className="d-flex align-items-start gap-3">
            <TintIcon icon={BsCheck2Circle} tone="primary" size={48} iconSize={20} shape="square" />
            <div>
              <div className="fw-semibold mb-1" style={{ fontSize: 15, color: '#101828' }}>Setup Checklist</div>
              <div className="text-muted" style={{ fontSize: 13.5, lineHeight: 1.6 }}>
                Follow the first four steps to start recording attendance, viewing reports, and managing daily ministry operations.
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex flex-column" style={{ gap: 16 }}>
          {SETUP_GUIDE_SECTIONS.map((section) => (
            <SetupGuideCard key={section.title} section={section} onNavigate={onNavigate} />
          ))}
        </div>

        <div
          className="rounded-4 mt-4"
          style={{
            background: '#FFF9E7',
            border: '1px solid #FDE68A',
            padding: '16px 18px'
          }}
        >
          <div className="fw-semibold mb-1" style={{ fontSize: 14, color: '#92400E' }}>💡 Tip</div>
          <div style={{ fontSize: 13.5, color: '#7C2D12', lineHeight: 1.6 }}>
            Complete the first four steps to unlock the full church dashboard.
          </div>
        </div>
      </div>

      <div className="px-4 py-3 d-flex gap-2" style={{ borderTop: '1px solid #EAECF0', background: '#fff', position: 'sticky', bottom: 0, zIndex: 2 }}>
        <button
          type="button"
          onClick={onClose}
          className="flex-fill"
          style={{
            background: '#fff',
            border: '1px solid #D0D5DD',
            color: '#344054',
            fontWeight: 600,
            fontSize: 14,
            borderRadius: 10,
            padding: '11px 0'
          }}
        >
          Close
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-fill"
          style={{
            background: '#2F5AF0',
            border: 'none',
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            borderRadius: 10,
            padding: '11px 0'
          }}
        >
          Continue Setup
        </button>
      </div>
    </Offcanvas.Body>
  </Offcanvas>
);

const PanelEmptyState = ({ icon, title, message, actionLabel, onAction, tone, buttonTone = 'primary' }) => {
  const { bg, fg } = TONE_TINT[tone] || TONE_TINT.primary;
  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center py-4">
      <span
        className="d-inline-flex align-items-center justify-content-center mb-3"
        style={{ width: 52, height: 52, borderRadius: '50%', background: bg, color: fg, fontSize: 22 }}
      >
        {React.createElement(icon)}
      </span>
      <h6 className="mb-1" style={{ fontSize: 14 }}>{title}</h6>
      <p className="text-muted mb-3" style={{ fontSize: 12, maxWidth: 180 }}>{message}</p>
      <JerurFeatureButton title={actionLabel} onClick={onAction} tone={buttonTone} />
    </div>
  );
};

const QuickActionsCard = ({ onNavigate }) => (
  <Card className="border-0 h-100" style={CARD_STYLE}>
    <Card.Body className="p-3">
      <h6 className="fw-bold mb-3">Quick Actions</h6>
      <div className="d-flex flex-column" style={{ gap: 14 }}>
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.title}
              type="button"
              onClick={() => onNavigate(action.href)}
              aria-label={action.title}
              style={{
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                background: '#fff',
                border: '1px solid #EEF0F5',
                borderRadius: 14,
                padding: '14px 16px',
                transition: 'box-shadow 0.15s ease, border-color 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(16,24,40,0.06)'; e.currentTarget.style.borderColor = '#DCE1F0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#EEF0F5'; }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <TintIcon icon={Icon} tone={action.tone} size={48} iconSize={20} shape="square" />
                <span style={{ minWidth: 0 }}>
                  <span className="d-block fw-semibold text-dark" style={{ fontSize: 14 }}>{action.title}</span>
                  <span className="d-block text-muted" style={{ fontSize: 12 }}>{action.description}</span>
                </span>
              </span>
              <BsChevronRight className="text-muted" style={{ fontSize: 14, flexShrink: 0 }} />
            </button>
          );
        })}
      </div>
    </Card.Body>
  </Card>
);

const SetupProgressCard = ({ onboarding, onNavigate }) => {
  const completedSome = onboarding.completedCount > 0;
  return (
    <Card className="border-0 h-100" style={CARD_STYLE}>
      <Card.Body className="p-3">
        <h6 className="fw-bold mb-3">Setup Progress</h6>
        <div className="d-flex flex-column gap-1">
          {FLAT_SETUP_TASKS.map((task) => (
            <ChecklistRow key={task.key} task={task} onboarding={onboarding} onNavigate={onNavigate} />
          ))}
        </div>
        {completedSome ? (
          <div className="mt-3 p-2 rounded-3 d-flex align-items-start gap-2" style={{ background: '#fff8e1' }}>
            <span style={{ fontSize: 16 }}>🎉</span>
            <div>
              <div className="fw-semibold" style={{ fontSize: 13 }}>Great job!</div>
              <div className="text-muted" style={{ fontSize: 11 }}>Keep going, you&apos;re doing well.</div>
            </div>
          </div>
        ) : null}
      </Card.Body>
    </Card>
  );
};

const FellowshipCard = ({ count = 0, onNavigate }) => (
  <Card className="border-0 h-100" style={CARD_STYLE}>
    <Card.Body className="p-3">
      <h6 className="fw-bold mb-0">Fellowship</h6>
      <p className="text-muted mb-3" style={{ fontSize: 12 }}>Active Groups</p>
      {count > 0 ? (
        <>
          <div className="mb-3">
            <div className="text-muted mb-1" style={{ fontSize: 12 }}>Total Groups</div>
            <div className="fs-3 fw-bold">{count}</div>
          </div>
          <button
            type="button"
            className="w-100"
            style={{ background: '#F2994A', border: 'none', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 8, padding: '8px 0' }}
            onClick={() => onNavigate('/protected/church/fellowships')}
          >
            View Fellowships
          </button>
        </>
      ) : (
        <PanelEmptyState
          icon={BsPeople}
          title="No fellowship groups yet"
          message="Create your first fellowship group to bring members together."
          actionLabel="Add Fellowship Group"
          tone="warning"
          buttonTone="warning"
          onAction={() => onNavigate('/protected/church/fellowships')}
        />
      )}
    </Card.Body>
  </Card>
);

const WelcomeOverlay = ({ show, onGetStarted, onDismiss }) => {
  if (!show) return null;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        width: 360,
        zIndex: 1050,
        borderRadius: 18,
        boxShadow: '0 20px 60px rgba(16, 24, 40, 0.22)',
        background: '#fff',
        overflow: 'hidden',
        padding: '28px 28px 24px'
      }}
      role="dialog"
      aria-label="Welcome to Jerur"
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss welcome message"
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          border: 'none',
          background: 'transparent',
          color: '#344054',
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <BsX style={{ fontSize: 20 }} />
      </button>

      <div className="mb-3">
        <WelcomeIllustration size={170} />
      </div>

      <h4 className="fw-bold mb-2 text-center">Welcome to Jerur! 🎉</h4>
      <p className="text-muted text-center mb-3" style={{ fontSize: 13.5 }}>
        Congratulations! Your church workspace has been created successfully. Let&apos;s get your church ready in just a few steps.
      </p>
      <div className="d-flex flex-column gap-2 mb-4">
        {['Add your members', 'Create your first service', 'Record attendance', 'Start managing your church'].map((step) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <span
              style={{
                flexShrink: 0,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#16A34A',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <BsCheck2Circle style={{ fontSize: 13 }} />
            </span>
            <span style={{ fontWeight: 600, color: '#16213E' }}>{step}</span>
          </div>
        ))}
      </div>
      <div className="d-flex gap-2">
        <button
          type="button"
          className="flex-fill"
          style={{ background: '#2F5AF0', border: 'none', color: '#fff', fontWeight: 600, fontSize: 14, borderRadius: 10, padding: '11px 0' }}
          onClick={onGetStarted}
        >
          Get Started
        </button>
        <button
          type="button"
          className="flex-fill"
          style={{ background: '#fff', border: '1.5px solid #2F5AF0', color: '#2F5AF0', fontWeight: 600, fontSize: 14, borderRadius: 10, padding: '11px 0' }}
          onClick={onDismiss}
        >
          I&apos;ll Do This Later
        </button>
      </div>
    </div>
  );
};

/* Bottom-right onboarding tour tooltip (product-tour style, distinct from the
   setup checklist) + its floating "?" launcher. */
const TourTooltip = ({ step, total, title, body, onNext, onDismiss }) => (
  <div
    style={{
      position: 'fixed',
      bottom: 92,
      right: 24,
      width: 260,
      zIndex: 1050,
      borderRadius: 14,
      boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
      background: '#fff',
      padding: 18
    }}
    role="dialog"
    aria-label="Dashboard tour"
  >
    <div className="d-flex justify-content-between align-items-start mb-2">
      <span className="text-muted small">{step} of {total}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Close tour"
        style={{ border: 'none', background: 'transparent', borderRadius: 8, padding: 4, color: '#8A90A2' }}
      >
        <BsX style={{ fontSize: 16 }} />
      </button>
    </div>
    <h6 className="fw-bold mb-2">{title}</h6>
    <p className="text-muted mb-3" style={{ fontSize: 13 }}>{body}</p>
    <button
      type="button"
      className="d-flex align-items-center gap-1"
      style={{ background: '#2F5AF0', border: 'none', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 8, padding: '7px 14px' }}
      onClick={onNext}
    >
      {step === total ? 'Got it' : 'Next'} <BsChevronRight style={{ fontSize: 12 }} />
    </button>
  </div>
);

const HelpFab = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Open dashboard tour"
    style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      width: 48,
      height: 48,
      borderRadius: '50%',
      border: 'none',
      background: '#2F5AF0',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 20px rgba(47,90,240,0.35)',
      zIndex: 1049
    }}
  >
    <BsQuestionCircle style={{ fontSize: 20 }} />
  </button>
);

/* ─────────────────────────────────────────────────────────── Dashboard ─── */

const Dashboard = ({ dashboard }) => {
  const router       = useRouter();
  const checklistRef = useRef(null);
  const { recentData, trentData, data, loading, error, fetchAll } = dashboard;

  const [setupGuideVisible, setSetupGuideVisible] = useState(false);
  const [welcomeVisible,    setWelcomeVisible]    = useState(false);
  const [checklistDismissed, setChecklistDismissed] = useState(false);
  const [persistingState,   setPersistingState]   = useState(false);

  // Bottom-right product tour (separate from onboarding checklist).
  const [tourVisible, setTourVisible] = useState(false);
  const [tourStep,    setTourStep]    = useState(1);

  const onboarding     = data?.onboarding || DEFAULT_ONBOARDING;
  const membersEmpty   = (data?.members  || 0) === 0;
  const attendanceEmpty = (data?.attendance || 0) === 0;

  useEffect(() => {
    if (onboarding.completed) {
      setWelcomeVisible(false);
      setChecklistDismissed(false);
      return;
    }
    setChecklistDismissed(Boolean(onboarding.setupChecklistDismissed));
    setWelcomeVisible(!onboarding.dismissed);
  }, [onboarding.completed, onboarding.dismissed, onboarding.setupChecklistDismissed]);

  // Show the tour once per browser, independent of the server-persisted
  // onboarding state. Reopen anytime via the help FAB.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dismissed = window.localStorage.getItem(TOUR_STORAGE_KEY);
    if (!dismissed) setTourVisible(true);
  }, []);

  const persistOnboardingState = useCallback(async (partialOnboardingState) => {
    setPersistingState(true);
    try {
      const nextOnboardingState = {
        ...(data?.onboarding ? {
          welcomeModalDismissed:  Boolean(onboarding.dismissed),
          setupChecklistDismissed: Boolean(onboarding.setupChecklistDismissed),
          onboardingCompleted:    Boolean(onboarding.completed)
        } : {}),
        ...partialOnboardingState
      };
      const response = await zat(`${CHURCH.uploadOne}?action=bulk`, { onboarding: nextOnboardingState }, VERBS.PUT);
      if (!response.success) throw new Error(response.errorMessage || 'Unable to update onboarding state.');
      await fetchAll();
      return true;
    } catch (persistError) {
      window.alert(persistError.message || 'Unable to update onboarding state.');
      return false;
    } finally {
      setPersistingState(false);
    }
  }, [data?.onboarding, fetchAll, onboarding.completed, onboarding.dismissed, onboarding.setupChecklistDismissed]);

  const handleNavigate = useCallback((href) => { router.push(href); }, [router]);

  const handleDismissWelcome = useCallback(async () => {
    const ok = await persistOnboardingState({
      welcomeModalDismissed:  true,
      setupChecklistDismissed: Boolean(onboarding.setupChecklistDismissed),
      onboardingCompleted:    Boolean(onboarding.completed)
    });
    if (ok) setWelcomeVisible(false);
  }, [onboarding.completed, onboarding.setupChecklistDismissed, persistOnboardingState]);

  const handleGetStarted = useCallback(async () => {
    const ok = await persistOnboardingState({
      welcomeModalDismissed:  true,
      setupChecklistDismissed: false,
      onboardingCompleted:    Boolean(onboarding.completed)
    });
    if (ok) {
      setWelcomeVisible(false);
      setChecklistDismissed(false);
      checklistRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [onboarding.completed, persistOnboardingState]);

  const handleDismissChecklist = useCallback(async () => {
    const ok = await persistOnboardingState({
      welcomeModalDismissed:  true,
      setupChecklistDismissed: true,
      onboardingCompleted:    Boolean(onboarding.completed)
    });
    if (ok) setChecklistDismissed(true);
  }, [onboarding.completed, persistOnboardingState]);

  const handleTourNext = useCallback(() => {
    setTourStep((prev) => {
      if (prev >= TOUR_STEPS.length) {
        setTourVisible(false);
        if (typeof window !== 'undefined') window.localStorage.setItem(TOUR_STORAGE_KEY, '1');
        return prev;
      }
      return prev + 1;
    });
  }, []);

  const handleTourDismiss = useCallback(() => {
    setTourVisible(false);
    if (typeof window !== 'undefined') window.localStorage.setItem(TOUR_STORAGE_KEY, '1');
  }, []);

  const handleTourReopen = useCallback(() => {
    setTourStep(1);
    setTourVisible(true);
  }, []);

  const handleOpenSetupGuide = useCallback(() => {
    setSetupGuideVisible(true);
  }, []);

  const handleCloseSetupGuide = useCallback(() => {
    setSetupGuideVisible(false);
  }, []);

  const kpiCards = useMemo(() => KPI_CONFIG.map((c) => ({ ...c, value: getDashboardAggregateValue(data, c.key) })), [data]);
  const activeTourStep = TOUR_STEPS[tourStep - 1];

  return (
    <>
      <SetupGuideDrawer show={setupGuideVisible} onClose={handleCloseSetupGuide} onNavigate={handleNavigate} />

      {/* ── Fixed bottom-left welcome overlay ── */}
      <WelcomeOverlay show={welcomeVisible} onGetStarted={handleGetStarted} onDismiss={handleDismissWelcome} />

      {/* ── Saving indicator ── */}
      {persistingState ? (
        <div className="mb-2 d-flex align-items-center text-muted small">
          <Spinner size="sm" className="me-2" />Saving…
        </div>
      ) : null}

      {/* ── Error banner ── */}
      {error ? <div className="alert alert-danger py-2 small mb-3">{error}</div> : null}

      {/* ── Row 1: KPI cards ── */}
      <div className="row g-3 mb-0">
        {kpiCards.map((card) => <KpiCard key={card.key} {...card} />)}
      </div>

      {/* ── Row 2: Setup checklist (dismissible) ── */}
      {!checklistDismissed ? (
        <SetupChecklistCard
          onboarding={onboarding}
          onNavigate={handleNavigate}
          onDismiss={handleDismissChecklist}
          onOpenGuide={handleOpenSetupGuide}
          checklistRef={checklistRef}
        />
      ) : null}

      {/* ── Row 3: Content panels ── */}
      <div className="row g-3 mt-2">

        {/* Attendance */}
        <div className="col-xl-3 col-md-6">
          <Card className="border-0 h-100" style={CARD_STYLE}>
            <Card.Body className="p-3">
              <h6 className="fw-bold mb-0">Attendance</h6>
              <p className="text-muted mb-3" style={{ fontSize: 12 }}>Last 7 Days</p>
              {attendanceEmpty ? (
                <PanelEmptyState
                  icon={BsCalendarEvent}
                  title="No attendance recorded yet"
                  message="Record your first attendance to start seeing attendance trends."
                  actionLabel="Record Attendance"
                  tone="primary"
                  buttonTone="success"
                  onAction={() => handleNavigate('/protected/church/attendance')}
                />
              ) : (
                <AttendanceChart data={trentData} loading={loading} />
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Fellowship */}
        <div className="col-xl-3 col-md-6">
          <FellowshipCard count={data?.fellowships || 0} onNavigate={handleNavigate} />
        </div>

        {/* Quick Actions */}
        <div className="col-xl-3 col-md-6">
          <QuickActionsCard onNavigate={handleNavigate} />
        </div>

        {/* Setup Progress */}
        <div className="col-xl-3 col-md-6">
          <SetupProgressCard onboarding={onboarding} onNavigate={handleNavigate} />
        </div>
      </div>

      {/* ── Row 4: Recent Members (full width) ── */}
      <div className="row g-3 mt-2">
        <div className="col-12">
          <Card className="border-0" style={CARD_STYLE}>
            <Card.Body className="p-3 p-lg-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">Recent Members</h6>
                <button
                  type="button"
                  className="p-0 small"
                  style={{ background: 'transparent', border: 'none', color: '#2F5AF0', fontWeight: 600 }}
                  onClick={() => handleNavigate('/protected/church/members')}
                >
                  View All Members →
                </button>
              </div>
              {membersEmpty ? (
                <div className="py-4 text-center">
                  <div className="d-flex justify-content-center mb-3">
                    <TintIcon icon={BsPeople} tone="primary" size={48} iconSize={20} />
                  </div>
                  <p className="text-muted small mb-2">No members added yet.</p>
                  <JerurFeatureButton
                    title="Add Member"
                    tone="primary"
                    onClick={() => handleNavigate('/protected/church/members')}
                  />
                </div>
              ) : (
                <RecentMembers data={recentData} />
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* ── Fixed bottom-right product tour + help launcher ── */}
      {tourVisible ? (
        <TourTooltip
          step={tourStep}
          total={TOUR_STEPS.length}
          title={activeTourStep.title}
          body={activeTourStep.body}
          onNext={handleTourNext}
          onDismiss={handleTourDismiss}
        />
      ) : null}
      <HelpFab onClick={handleTourReopen} />
    </>
  );
};

export default Dashboard;