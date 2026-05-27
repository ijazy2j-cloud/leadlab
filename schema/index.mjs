export default async function createSchemaHandler(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ll_users (
      id         serial PRIMARY KEY,
      name       text NOT NULL,
      email      text UNIQUE,
      role       text,
      team       text,
      is_admin   boolean DEFAULT false,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ll_principles (
      id                serial PRIMARY KEY,
      number            int UNIQUE,
      name              text,
      intent            text,
      objectives        text,
      behaviours        text,
      short_description text,
      created_at        timestamptz DEFAULT now(),
      updated_at        timestamptz DEFAULT now()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ll_activities (
      id           serial PRIMARY KEY,
      principle_id int REFERENCES ll_principles(id),
      name         text,
      duration     text,
      steps        text,
      type         text,
      created_at   timestamptz DEFAULT now(),
      updated_at   timestamptz DEFAULT now()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ll_decision_log (
      id              serial PRIMARY KEY,
      user_id         int REFERENCES ll_users(id),
      decision        text,
      q1_answer       text CHECK (q1_answer IN ('YES','NO','UNSURE')),
      q1_why          text,
      q2_answer       text CHECK (q2_answer IN ('YES','NO','UNSURE')),
      q2_why          text,
      q3_answer       text CHECK (q3_answer IN ('YES','NO','UNSURE')),
      q3_why          text,
      q4_answer       text CHECK (q4_answer IN ('YES','NO','UNSURE')),
      q4_why          text,
      outcome         text CHECK (outcome IN ('PROCEED','PAUSE','AMEND','STOP')),
      follow_up_date  timestamptz,
      follow_up_note  text,
      created_at      timestamptz DEFAULT now(),
      updated_at      timestamptz DEFAULT now()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ll_medical_case (
      id              serial PRIMARY KEY,
      user_id         int REFERENCES ll_users(id),
      title           text,
      symptoms        text,
      diagnosis       text,
      treatment       text,
      follow_up       text,
      follow_up_date  timestamptz,
      created_at      timestamptz DEFAULT now(),
      updated_at      timestamptz DEFAULT now()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ll_big_five (
      id              serial PRIMARY KEY,
      user_id         int REFERENCES ll_users(id),
      topic           text,
      priorities      jsonb,
      follow_up_date  timestamptz,
      created_at      timestamptz DEFAULT now(),
      updated_at      timestamptz DEFAULT now()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ll_follow_up (
      id          serial PRIMARY KEY,
      user_id     int REFERENCES ll_users(id),
      source_type text CHECK (source_type IN ('DECISION','MEDICAL','BIG_FIVE','COACHING','MANUAL')),
      source_id   int,
      commitment  text,
      owner       text DEFAULT 'me',
      due_date    timestamptz,
      status      text DEFAULT 'OPEN' CHECK (status IN ('OPEN','DONE','CANCELLED')),
      outcome     text,
      created_at  timestamptz DEFAULT now(),
      updated_at  timestamptz DEFAULT now()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ll_practice_log (
      id           serial PRIMARY KEY,
      user_id      int REFERENCES ll_users(id),
      principle_id int REFERENCES ll_principles(id),
      activity_id  int REFERENCES ll_activities(id),
      date         timestamptz DEFAULT now(),
      notes        text,
      status       text DEFAULT 'DRAFT',
      created_at   timestamptz DEFAULT now(),
      updated_at   timestamptz DEFAULT now()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ll_jwt_key (
      key     text PRIMARY KEY,
      secret  text,
      created timestamptz DEFAULT current_timestamp
    )
  `);

  // Future-proof: add columns that may be missing in older deployments
  const additions = [
    `ALTER TABLE ll_decision_log ADD COLUMN IF NOT EXISTS follow_up_note text`,
    `ALTER TABLE ll_medical_case ADD COLUMN IF NOT EXISTS follow_up text`,
    `ALTER TABLE ll_follow_up    ADD COLUMN IF NOT EXISTS outcome text`,
    `ALTER TABLE ll_practice_log ADD COLUMN IF NOT EXISTS status text DEFAULT 'DRAFT'`,
  ];
  for (const sql of additions) {
    await pool.query(sql);
  }

  console.log('Schema ready: all ll_ tables created or verified.');
}
