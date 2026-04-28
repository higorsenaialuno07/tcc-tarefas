import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://venkaptdplnzcsbrmssl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbmthcHRkcGxuemNzYnJtc3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyNTI5OTcsImV4cCI6MjA5MjgyODk5N30.F6_7GrBWjXfDbGuMp0RJ96P1wU4gerc0jhFp2P9Msl0'

export const supabase = createClient(supabaseUrl, supabaseKey)