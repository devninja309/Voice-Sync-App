CREATE SCHEMA `IA_VoiceSynth` ;

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