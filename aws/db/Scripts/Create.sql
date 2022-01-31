CREATE SCHEMA `IA_VoiceSynth` ;

CREATE USER 'VoiceSynthUser'@'sg-04915abf5725a81d2' IDENTIFIED BY '3ntranc3';
GRANT SELECT, INSERT, UPDATE, DELETE ON IA_VoiceSynth.* TO 'VoiceSynthUser'@'sg-04915abf5725a81d2';

CREATE TABLE `IA_VoiceSynth`.`Courses` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `CourseName` VARCHAR(45) NULL,
  `CourseDescription` LongText Null,
  PRIMARY KEY (`ID`));

CREATE TABLE `IA_VoiceSynth`.`Chapters` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `ChapterName` VARCHAR(45) NULL,
  `CourseID` INT NOT NULL,
  FOREIGN KEY (`CourseID`)
    REFERENCES `IA_VoiceSynth`.`Courses`(`ID`),
  PRIMARY KEY (`ID`));

Create Table `IA_VoiceSynth`.`Slides` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `SlideName` VARCHAR(45) NULL,
  `ChapterID` INT NOT NULL,
  `SlideText` LongText NULL,
  `MergedClip` LongBlob NULL,
  FOREIGN KEY (`ChapterID`)
    REFERENCES `IA_VoiceSynth`.`Chapters`(`ID`),
  PRIMARY KEY (`ID`));

  
Create Table `IA_VoiceSynth`.`Clips` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `SlideID` INT NOT NULL,
  `ClipText` LongText NULL,
  `AudioClip` LongBlob NULL,
  FOREIGN KEY (`SlideID`)
    REFERENCES `IA_VoiceSynth`.`Slides`(`ID`),
  PRIMARY KEY (`ID`));

  Alter Table  `IA_VoiceSynth`.`Slides` 
    ADD COLUMN VoiceID int null default 3

  Alter Table  `IA_VoiceSynth`.`Clips` 
    ADD COLUMN VoiceID int null default 3

  Alter Table  `IA_VoiceSynth`.`Clips` 
    ADD COLUMN OrdinalValue int null default null

Create Table `IA_VoiceSynth`.`LogEntry` (
  `ID` Binary(16) NOT NULL,
  `LogType` INT NOT NULL,
  `TimeStamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Message` LongText NULL,
  `User` Varchar(50) NULL
  PRIMARY KEY (`ID`));
  
Create Table `IA_VoiceSynth`.`Pronunciations` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Word` LongText Not Null,
  `Pronunciation` LongText Not Null,
  PRIMARY KEY (`ID`))

