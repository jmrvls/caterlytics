// Whether the logged-in Staff member may take/record client payments.
// Admin / Owner always can. The flag lives in tbl_profiles.can_take_payments
// and is refreshed into sessionStorage by the router guard (main.js) on every
// navigation. This is only for hiding UI -- the real enforcement is the
// database trigger in RUN_THIS_IN_SUPABASE_SQL_EDITOR.sql.
export function canTakePayments(user) {
  try {
    const u = user || JSON.parse(sessionStorage.getItem('user') || '{}')
    if (u.role !== 'Staff') return true
    return u.can_take_payments !== false
  } catch {
    return false
  }
}