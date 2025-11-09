CREATE TABLE `ai_cache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`prompt_hash` varchar(64) NOT NULL,
	`prompt` text NOT NULL,
	`response` text NOT NULL,
	`model_used` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_cache_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_cache_prompt_hash_unique` UNIQUE(`prompt_hash`)
);
--> statement-breakpoint
CREATE TABLE `analytics_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`event_type` varchar(100) NOT NULL,
	`event_data` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`message` text NOT NULL,
	`response` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `class_enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`class_id` int NOT NULL,
	`student_id` int NOT NULL,
	`enrolled_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `class_enrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `classes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teacher_id` int NOT NULL,
	`class_name` varchar(255) NOT NULL,
	`grade_level` varchar(20),
	`subject` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `classes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leaderboard` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`xp` int NOT NULL DEFAULT 0,
	`county` varchar(100),
	`school` varchar(255),
	`rank` int,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leaderboard_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`topic` varchar(255),
	`grade_level` varchar(20),
	`source` varchar(50) NOT NULL DEFAULT 'manual',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `past_papers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`exam_board` varchar(100),
	`subject` varchar(100) NOT NULL,
	`year` int,
	`grade_level` varchar(20),
	`file_url` text,
	`uploaded_by` int,
	`is_public` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `past_papers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quiz_id` int NOT NULL,
	`question` text NOT NULL,
	`question_type` varchar(20) NOT NULL,
	`options` text,
	`correct_answer` text NOT NULL,
	`explanation` text,
	`points` int NOT NULL DEFAULT 10,
	CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`topic` text NOT NULL,
	`grade_level` varchar(20),
	`source` varchar(50) NOT NULL,
	`metadata` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quizzes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrer_id` int NOT NULL,
	`referred_id` int,
	`referral_code` varchar(20) NOT NULL,
	`redeemed` int NOT NULL DEFAULT 0,
	`redeemed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_referral_code_unique` UNIQUE(`referral_code`)
);
--> statement-breakpoint
CREATE TABLE `results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quiz_id` int NOT NULL,
	`user_id` int NOT NULL,
	`score` int NOT NULL,
	`total_points` int NOT NULL,
	`xp_earned` int NOT NULL DEFAULT 0,
	`coins_earned` int NOT NULL DEFAULT 0,
	`feedback` text,
	`completed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`grade_level` varchar(20) NOT NULL,
	`county` varchar(100),
	`school` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `syllabus` (
	`id` int AUTO_INCREMENT NOT NULL,
	`exam_board` varchar(100) NOT NULL,
	`grade_level` varchar(20) NOT NULL,
	`subject` varchar(100) NOT NULL,
	`topic` varchar(255) NOT NULL,
	`subtopics` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `syllabus_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `uploads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`file_url` text NOT NULL,
	`file_key` text NOT NULL,
	`mime_type` varchar(100),
	`file_size` int,
	`summary` text,
	`extracted_text` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `uploads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `xp` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `coins` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `streak` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `level` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `streak_freeze_tokens` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `last_streak_update` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `users` ADD `free_expires_at` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `analytics_events` ADD CONSTRAINT `analytics_events_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chats` ADD CONSTRAINT `chats_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `class_enrollments` ADD CONSTRAINT `class_enrollments_class_id_classes_id_fk` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `class_enrollments` ADD CONSTRAINT `class_enrollments_student_id_users_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `classes` ADD CONSTRAINT `classes_teacher_id_users_id_fk` FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leaderboard` ADD CONSTRAINT `leaderboard_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notes` ADD CONSTRAINT `notes_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `past_papers` ADD CONSTRAINT `past_papers_uploaded_by_users_id_fk` FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questions` ADD CONSTRAINT `questions_quiz_id_quizzes_id_fk` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quizzes` ADD CONSTRAINT `quizzes_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referrer_id_users_id_fk` FOREIGN KEY (`referrer_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referred_id_users_id_fk` FOREIGN KEY (`referred_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `results` ADD CONSTRAINT `results_quiz_id_quizzes_id_fk` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `results` ADD CONSTRAINT `results_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_profiles` ADD CONSTRAINT `student_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `uploads` ADD CONSTRAINT `uploads_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;