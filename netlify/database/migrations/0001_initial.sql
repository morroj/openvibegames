CREATE TABLE profiles (id text PRIMARY KEY, auth_id text NOT NULL UNIQUE, name text NOT NULL, bio text NOT NULL DEFAULT '');
CREATE TABLE games (id text PRIMARY KEY, owner text NOT NULL REFERENCES profiles(id), name text NOT NULL, description text NOT NULL, genre text NOT NULL, controls text NOT NULL, embed text NOT NULL, source text NOT NULL, cover text NOT NULL DEFAULT '', trailer text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'published' CHECK (status IN ('published','draft','archived')), created bigint NOT NULL);
CREATE INDEX idx_games_owner ON games(owner);
CREATE INDEX idx_games_status_created ON games(status,created);
CREATE TABLE ratings (game text NOT NULL REFERENCES games(id), "user" text NOT NULL REFERENCES profiles(id), stars integer NOT NULL CHECK (stars BETWEEN 1 AND 5), PRIMARY KEY(game,"user"));
CREATE TABLE plays (game text NOT NULL REFERENCES games(id), visitor text NOT NULL, bucket bigint NOT NULL, PRIMARY KEY(game,visitor,bucket));
