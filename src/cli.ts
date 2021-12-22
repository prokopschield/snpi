#!/usr/bin/env node

import { all } from '.';

all('.', ...process.argv.slice(2));
