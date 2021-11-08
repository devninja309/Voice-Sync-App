CREATE SCHEMA `IA_VoiceSynth` ;

CREATE TABLE `IA_VoiceSynth`.`Projects` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `ProjectName` VARCHAR(45) NULL,
  PRIMARY KEY (`ID`));

INSERT INTO `IA_VoiceSynth`.`Projects` (`ID`, `ProjectName`) VALUES ('1', 'Project 1');
INSERT INTO `IA_VoiceSynth`.`Projects` (`ID`, `ProjectName`) VALUES ('2', 'Project 2');
INSERT INTO `IA_VoiceSynth`.`Projects` (`ID`, `ProjectName`) VALUES ('3', 'Project 3');
