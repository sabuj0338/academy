// Site-এর সব URL এক জায়গায় — base path (/academy) বদলালেও কোথাও হাত দিতে হবে না
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

export const url = (p = '') => BASE + '/' + p.replace(/^\//, '');
export const href = {
  home: () => url(''),
  courses: () => url('courses/'),
  course: (id) => url(`courses/${id}/`),
  lesson: (id, seg) => url(`learn/${id}/`) + (seg ? '#' + seg : ''),
  handbook: (id) => url(id && id !== 'all' ? `handbook/${id}/` : 'handbook/'),
};
export const go = (to) => { window.location.href = to; };
