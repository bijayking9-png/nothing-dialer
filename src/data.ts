import { Contact, CallLog } from './types';

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'c-1',
    name: 'Aaron Smith',
    number: '+1 555 0120',
    label: 'MOBILE',
    initials: 'AA',
    group: 'A'
  },
  {
    id: 'c-2',
    name: 'Alex Rivera',
    number: '+1 555 0892',
    label: 'WORK',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBldCCe17mY6mkiKY7jH7bNiqjGIzwaAiWJ06tmGBs_FRpA0HSyijFlRtDu-DEJB9N7LsxNOBW0eJoAZuuCpvuiiTUhu2T3rJAUHJW0lDt2L9axRddssJyNK7UMPn5ZJIieuhzRaZSHOJx1E4HiQlldXSsbE8LD7k1cofqK5A4xGiWsIfHz02l9avlyX9-CYzuKAG7VajB4fhUcRvKAe1QCp3qN4deMx_wJbzVRz2FztYE8rELFsiH4rfGH87O7gP_N84oblt2Uxs8',
    initials: 'AR',
    group: 'A'
  },
  {
    id: 'c-3',
    name: 'Alex Chen',
    number: '+1 (555) 019-2831',
    label: 'MOBILE',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYhq-Copdj8QkQu_BqgsQIZ38xxkRmesy5E0jDRsp951NlaYcvU-JlncjJU9pSoyrCWPvVIheycKa1Uc8W0jnFHisDWHXKJJpCVoZAqUa9r-Iu9eNs-8Ob0FiPf6RobhnIZnDVfe7MVyl6N4DmwgUOVT1d_keuBcJ44prjLXO999wjSz-QQKyPhN1D6mIW06trhd49iqfxqoKUKBHWuD9L9BkNBYIV0pFyh0jazBF3Dj3Z9fr3d1-FInJuqPJa-ng_JRXu93tEzVQ',
    initials: 'AC',
    group: 'A'
  },
  {
    id: 'c-4',
    name: 'Alexander Brand',
    number: '+1 555 0741',
    label: 'MOBILE',
    initials: 'AB',
    group: 'A'
  },
  {
    id: 'c-5',
    name: 'Alice Chen',
    number: '+1 555 0319',
    label: 'HOME',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxqcdra6DjN8Xmmb25nfzqDUxi4wl8y5xECL1QFiGkgThy2FrjgFLvTarU6XA-YMIe_0FcMAN7QeX4rIoZUuTlvGgY6972v0dRm9gjNrGmdLGbSNNooZab8LxkIGBvPcXhHMYf3d50fqvB06VySvPxvvNjrxLgqORcawyNfEHKHYaOsx-Fc4wMDB6cgSSOMzDR9XWJ-KhF6LMMKyGYI0C9ayQrUFuFRqNmWlKIrleuSL9OHZxL4gcIKLgLi9KM3BBV5QjHY-fDiyM',
    initials: 'AC',
    group: 'A'
  },
  {
    id: 'c-6',
    name: 'Arthur Vance',
    number: '+1 (555) 012-3456',
    label: 'MOBILE',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrSnGN12_Vxyp0CEbb3vhLAQIPq5ljnUDXcDQrZ-RJxp8cD9aV3iAT3JHIJJMGNZWTMIhflE2zaUYWI6-tSO6tuK7RGzyX6X_Sg_PKMz3vxL28_z68QSsbOgOoBPBBESlMoPekTrVjuU-M9fCWOErLXoSJ3o0cySFIuucDUl5pJciJjEvdwGpxM2GvzDTlQCKjQCbNSLwjPlQadpNx71h6OIUNhgpfKIjcdcjuhxR8usNMokdZEzsYSU-D0ypB6HJmN-IntWekFFg',
    initials: 'AV',
    group: 'A'
  },
  {
    id: 'c-7',
    name: 'Beth Thompson',
    number: '+1 555 0431',
    label: 'HOME',
    initials: 'BT',
    group: 'B'
  },
  {
    id: 'c-8',
    name: 'Benjamin Black',
    number: '+1 555 0561',
    label: 'WORK',
    initials: 'BB',
    group: 'B'
  },
  {
    id: 'c-9',
    name: 'Caleb Davidson',
    number: '+1 555 0412',
    label: 'MOBILE',
    initials: 'CD',
    group: 'C'
  },
  {
    id: 'c-10',
    name: 'Catherine Chen',
    number: '+1 555 0910',
    label: 'MOBILE',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQ5EuEGnGivxPkgMdIi3RaoYsSKzzigPKf9dOdSAjRGB46WOqI30ouXeKg87xSFgRGqR3gEsQHq8Kj2fnmdvzlVwlEJBdbdQE-KV1Fw5vlQSjN-69LLa_NeB92mlbpzxn_oIyviR05ACKyIq7i6YENUM2GURWYe2n_gXev7hZEQ_C6eir2kHBUva1fu3xy4SpNKOI4gGPSLNXQu50xdmX9wub8XTk9kKS_TMn02w3itUxSk6tJIZ_UKALJT3j3Z5V-Umww5oxObmc',
    initials: 'CC',
    group: 'C'
  },
  {
    id: 'c-11',
    name: 'Catherine Wu',
    number: '+1 555 0284',
    label: 'WORK',
    initials: 'CW',
    group: 'C'
  },
  {
    id: 'c-12',
    name: 'Chris Blackwell',
    number: '+1 555 0229',
    label: 'WORK',
    initials: 'CB',
    group: 'C'
  },
  {
    id: 'c-13',
    name: 'Julian Vossen',
    number: '+1 555 0102',
    label: 'MOBILE',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3GqW3h9rP3XfGw_gcfYCA24-ojA8kSHPZioFoXwWwAPNZFWfqWPuQrlvWGn_gIPWpzjS6vtfo3lrzfNoJRv4IREv0oQoF9uLzy8WhyfuCB4ywWu3Y9BVtJtdEcHU4MOoJYFfRcK5Bz65moy3gBAx-W8LgjDOJx0N7idI4rPwWoQtwmh8fpVZOg5wN5amZj7BgHKIJ-v8u_6Yf5-Z97Md6UWueC69iUIWZ4ouvjtxENWToREnJqOs-QvPFeTv5p_IVH3iYxZroPFg',
    initials: 'JV',
    group: 'J'
  },
  {
    id: 'c-14',
    name: 'Lena Weber',
    number: '+1 555 0831',
    label: 'HOME',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALF8fOJ6EPD3ds8cFXdyRoqTGLZcycjP7HYqooQKEcMq0z9jxTPvfKUaTWjz8Tng06R9LN6M-ciBO8xR6Pb2wKZrwvniKZqW8Zwd6ndHgbNO0mVzAsdq9rtbBOpeVZJ3iaU_u-dBFlsW5dGFjxULIqVl1nI2hW1D7jiz-pB-wDMHIG_qYgl4MYAlKzNTJbDYZ9_tKLLSFy3ZuM4qud4-NHVTailTirU3uJfhO6ACLoYOs7FlzIwSOiGjPP6UoAGbxE760CbLLrRsA',
    initials: 'LW',
    group: 'L'
  },
  {
    id: 'c-15',
    name: 'Marcus Thorne',
    number: '+1 555 0846',
    label: 'MOBILE',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-lx2gjNjQ1C-9tdONMjn2Dwo5_zN9XIXYBcBYp_ba8Ys2O0_kbZbLITxlEgky5GRAqBGPyxIcTZLDXnwf9N9HJ7VWZglMD783BXZjIFN87RK8vNJD-IdCJ3GtN4kSctETScUsqOeW2gR0iyU0G0ExQFKE7i_vl58Xv3JfpfD9DDPokojemvtN4iyccO8FaqkoFyb-FZ3DIRpQIWbgum9aK9-HXyCRkl0rgEgxRMoI0VRT62QF30d6U1kmIYCRxYihoJhEO0_xzLw',
    initials: 'MT',
    group: 'M'
  },
  {
    id: 'c-16',
    name: 'Sarah Chen',
    number: '+1 555 0912',
    label: 'WORK',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjan8SG6WMGmdvDnR-VDW0NTqwWjKONUj1SJxg0kobCu-ue08Xdzxx5o8UuKX5wB9yY7LT8Z4jDPCaOFXYX_0U2ovinYv-2i1WmvbEk9FlCQxvFZwc5cuA7ZSscMO-QjPXsU7AWLigqC3p2OB5qwornNRjeQV9x9v8JX0Q4fdVUfYZm7kYoPDw7esudYid_Yc6iYprIgPlLIJ9MBwveln1Yp-vVOYBMIdobVuYprngihPV_TeJZBG6q79PgCsFSoAw7ZxGB0pBqV8',
    initials: 'SC',
    group: 'S'
  }
];

export const INITIAL_CALL_LOGS: CallLog[] = [
  {
    id: 'log-1',
    name: 'Julian Vossen',
    number: '+1 555 0102',
    type: 'missed',
    label: 'MOBILE',
    time: '10:42 AM',
    count: 2,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3GqW3h9rP3XfGw_gcfYCA24-ojA8kSHPZioFoXwWwAPNZFWfqWPuQrlvWGn_gIPWpzjS6vtfo3lrzfNoJRv4IREv0oQoF9uLzy8WhyfuCB4ywWu3Y9BVtJtdEcHU4MOoJYFfRcK5Bz65moy3gBAx-W8LgjDOJx0N7idI4rPwWoQtwmh8fpVZOg5wN5amZj7BgHKIJ-v8u_6Yf5-Z97Md6UWueC69iUIWZ4ouvjtxENWToREnJqOs-QvPFeTv5p_IVH3iYxZroPFg',
    contactId: 'c-13'
  },
  {
    id: 'log-2',
    name: 'Sarah Chen',
    number: '+1 555 0912',
    type: 'received',
    label: 'WORK',
    time: 'Yesterday',
    contactId: 'c-16'
  },
  {
    id: 'log-3',
    name: 'Lena Weber',
    number: '+1 555 0831',
    type: 'made',
    label: 'HOME',
    time: 'Monday',
    duration: '12:04',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALF8fOJ6EPD3ds8cFXdyRoqTGLZcycjP7HYqooQKEcMq0z9jxTPvfKUaTWjz8Tng06R9LN6M-ciBO8xR6Pb2wKZrwvniKZqW8Zwd6ndHgbNO0mVzAsdq9rtbBOpeVZJ3iaU_u-dBFlsW5dGFjxULIqVl1nI2hW1D7jiz-pB-wDMHIG_qYgl4MYAlKzNTJbDYZ9_tKLLSFy3ZuM4qud4-NHVTailTirU3uJfhO6ACLoYOs7FlzIwSOiGjPP6UoAGbxE760CbLLrRsA',
    contactId: 'c-14'
  },
  {
    id: 'log-4',
    number: '+1 (555) 012-9934',
    type: 'received',
    label: 'UNKNOWN',
    time: 'Mar 12'
  },
  {
    id: 'log-5',
    name: 'Marcus Thorne',
    number: '+1 555 0846',
    type: 'missed',
    label: 'MOBILE',
    time: 'Mar 10',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-lx2gjNjQ1C-9tdONMjn2Dwo5_zN9XIXYBcBYp_ba8Ys2O0_kbZbLITxlEgky5GRAqBGPyxIcTZLDXnwf9N9HJ7VWZglMD783BXZjIFN87RK8vNJD-IdCJ3GtN4kSctETScUsqOeW2gR0iyU0G0ExQFKE7i_vl58Xv3JfpfD9DDPokojemvtN4iyccO8FaqkoFyb-FZ3DIRpQIWbgum9aK9-HXyCRkl0rgEgxRMoI0VRT62QF30d6U1kmIYCRxYihoJhEO0_xzLw',
    contactId: 'c-15'
  },
  {
    id: 'log-6',
    name: 'Alexander K.',
    number: '+1 (555) 041-3829',
    type: 'received',
    label: 'MOBILE',
    time: '2m ago',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_vN4EhZNyHjW-d678TXdECXb5nG7kUGiG5kJH3kG49Qi7UgtWN1ohH5Hj5zcXMgN5ujquuVI8CflemDWvKmF31Znh9aaTG5WDcbduDjPCfHqGmkBdZ3ffi2zhO4aV_jmbXsPBC08ObDmy_lZLgXcjRNmJG9Yd5uzkGI6Wf6KkzpjxDdauktBoFuYzELB9kH_xXtb8bAI5wqSoVulB_0Iw1cMnhuTq83J0n1lZqkVCdzDoNpZcbC09nXWkcioYuyPAGSztwvbmK7s',
    contactId: 'c-12' // linking Chris Blackwell or generic
  }
];

export const MY_PROFILE = {
  name: 'Matrix User',
  number: '+1 555 9991',
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk0MN-iZ6JYEThuPoGMfxjIfg29v6B9sgzo4r0tcu5ALY4w0X1fBzq-Fl4aDCrn2EcK4g5V86Gsz1STCa-wpKg4bzOiH_vE1jiMrHwzTBamsKp16FUcjSV-w7R-KT2qPkBSW007RAlE4q8RRtOuuWQHkk9kp24NSVpd5vO9Guz--BAKVguk_Sb60cjxJBNXiyNenpyTGZBpBhXXM8vy-3XfFC-dM8RRPEtxDf5N_MiUNBRr7CMG90dFUO4QujM6qIXfc680sJX0xQ'
};
