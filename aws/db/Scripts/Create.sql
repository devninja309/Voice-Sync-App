CREATE SCHEMA `IA_VoiceSynth` ;

CREATE TABLE `IA_VoiceSynth`.`Projects` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `ProjectName` VARCHAR(45) NULL,
  PRIMARY KEY (`ID`));

INSERT INTO `IA_VoiceSynth`.`Projects` (`ID`, `ProjectName`) VALUES ('1', 'Project 1');
INSERT INTO `IA_VoiceSynth`.`Projects` (`ID`, `ProjectName`) VALUES ('2', 'Project 2');
INSERT INTO `IA_VoiceSynth`.`Projects` (`ID`, `ProjectName`) VALUES ('3', 'Project 3');

Create Table `IA_VoiceSynth`.`Scripts` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `ScriptName` VARCHAR(45) NULL,
  'ProjectID' INT NOT NULL,
  'ScriptText' VARCHAR(MAX) NULL,
  FOREIGN KEY ('ProjectID')
    REFERENCES `IA_VoiceSynth`.`Projects`('ID'),
  PRIMARY KEY (`ID`));

Create Table `IA_VoiceSynth`.`Clips` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  'ScriptID' INT NOT NULL,
  'ScriptText' VARCHAR(MAX) NULL,
  FOREIGN KEY ('ScriptID')
    REFERENCES `IA_VoiceSynth`.`Scripts`('ID'),
  PRIMARY KEY (`ID`));
